begin;

insert into public.accounts (company_id, code, name, account_type)
select id, '1401', 'ضريبة مدخلات قابلة للاسترداد', 'asset'
from public.companies
on conflict (company_id, code) do nothing;

create or replace function public.create_purchase_order(
  p_actor_id uuid,
  p_supplier_id uuid,
  p_issue_date date,
  p_expected_date date,
  p_status text,
  p_tax_rate numeric,
  p_notes text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_role text;
  v_supplier_name text;
  v_purchase_id uuid;
  v_purchase_number text;
  v_prefix text;
  v_subtotal numeric(18,2) := 0;
  v_tax_amount numeric(18,2) := 0;
  v_total numeric(18,2) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_product_name text;
  v_quantity integer;
  v_unit_cost numeric(18,2);
begin
  select company_id, role into v_company_id, v_role
  from public.profiles where id = p_actor_id;

  if v_company_id is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if v_role not in ('owner', 'admin', 'accountant', 'inventory') then raise exception 'Actor is not allowed to create purchase orders'; end if;
  if p_status not in ('draft', 'ordered') then raise exception 'Invalid purchase order status'; end if;
  if p_issue_date is null or p_expected_date is null or p_expected_date < p_issue_date then raise exception 'Invalid purchase dates'; end if;
  if p_tax_rate is null or p_tax_rate < 0 or p_tax_rate > 100 then raise exception 'Invalid tax rate'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Purchase order requires at least one item'; end if;

  select name into v_supplier_name
  from public.suppliers
  where company_id = v_company_id and id = p_supplier_id and status = 'active';
  if v_supplier_name is null then raise exception 'Supplier not found or inactive'; end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    begin
      v_product_id := (v_item ->> 'product_id')::uuid;
      v_quantity := (v_item ->> 'quantity')::integer;
      v_unit_cost := (v_item ->> 'unit_cost')::numeric;
    exception when others then
      raise exception 'Invalid purchase item payload';
    end;
    if v_quantity <= 0 or v_unit_cost < 0 then raise exception 'Invalid purchase item quantity or cost'; end if;
    select name into v_product_name
    from public.products
    where company_id = v_company_id and id = v_product_id and is_active;
    if v_product_name is null then raise exception 'Product % not found or inactive', v_product_id; end if;
    v_subtotal := v_subtotal + round(v_quantity * v_unit_cost, 2);
  end loop;

  v_tax_amount := round(v_subtotal * (p_tax_rate / 100), 2);
  v_total := v_subtotal + v_tax_amount;

  select purchase_prefix into v_prefix from public.company_settings where company_id = v_company_id;
  if v_prefix is null then raise exception 'Company settings are missing'; end if;
  v_purchase_number := public.next_document_number(v_company_id, 'purchase', v_prefix);

  insert into public.purchase_orders (
    company_id, supplier_id, purchase_number, issue_date, expected_date, status,
    notes, subtotal, tax_rate, tax_amount, total, created_by
  ) values (
    v_company_id, p_supplier_id, v_purchase_number, p_issue_date, p_expected_date, p_status,
    coalesce(p_notes, ''), v_subtotal, p_tax_rate, v_tax_amount, v_total, p_actor_id
  ) returning id into v_purchase_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;
    v_unit_cost := (v_item ->> 'unit_cost')::numeric;
    select name into v_product_name from public.products where company_id = v_company_id and id = v_product_id;
    insert into public.purchase_order_items (company_id, purchase_order_id, product_id, product_name, quantity, unit_cost)
    values (v_company_id, v_purchase_id, v_product_id, v_product_name, v_quantity, v_unit_cost);
  end loop;

  insert into public.audit_logs (company_id, actor_id, action, entity_type, entity_id, metadata)
  values (v_company_id, p_actor_id, 'created_purchase_order', 'purchase_order', v_purchase_id,
    jsonb_build_object('purchase_number', v_purchase_number, 'supplier_id', p_supplier_id, 'total', v_total, 'status', p_status));

  return jsonb_build_object('purchase_order_id', v_purchase_id, 'purchase_number', v_purchase_number, 'total', v_total);
end;
$$;

create or replace function public.receive_purchase_order(
  p_actor_id uuid,
  p_purchase_order_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_role text;
  v_supplier_id uuid;
  v_purchase_number text;
  v_subtotal numeric(18,2);
  v_tax_amount numeric(18,2);
  v_total numeric(18,2);
  v_status text;
  v_default_warehouse_id uuid;
  v_item record;
  v_balance_after integer;
  v_inventory_account_id uuid;
  v_input_tax_account_id uuid;
  v_ap_account_id uuid;
  v_journal_id uuid;
  v_journal_number text;
begin
  select company_id, role into v_company_id, v_role from public.profiles where id = p_actor_id;
  if v_company_id is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if v_role not in ('owner', 'admin', 'accountant', 'inventory') then raise exception 'Actor is not allowed to receive purchase orders'; end if;

  select supplier_id, purchase_number, subtotal, tax_amount, total, status
    into v_supplier_id, v_purchase_number, v_subtotal, v_tax_amount, v_total, v_status
  from public.purchase_orders
  where company_id = v_company_id and id = p_purchase_order_id
  for update;

  if v_purchase_number is null then raise exception 'Purchase order not found'; end if;
  if v_status <> 'ordered' then raise exception 'Only ordered purchase orders can be received'; end if;

  select id into v_default_warehouse_id
  from public.warehouses
  where company_id = v_company_id and is_default and is_active
  limit 1;
  if v_default_warehouse_id is null then raise exception 'Default warehouse is not configured'; end if;

  for v_item in
    select product_id, product_name, quantity, unit_cost
    from public.purchase_order_items
    where company_id = v_company_id and purchase_order_id = p_purchase_order_id
  loop
    update public.products
      set stock = stock + v_item.quantity, cost = v_item.unit_cost
    where company_id = v_company_id and id = v_item.product_id;

    insert into public.product_inventory (company_id, warehouse_id, product_id, quantity, reserved_quantity)
    values (v_company_id, v_default_warehouse_id, v_item.product_id, v_item.quantity, 0)
    on conflict (company_id, warehouse_id, product_id)
    do update set quantity = public.product_inventory.quantity + excluded.quantity
    returning quantity into v_balance_after;

    insert into public.inventory_movements (
      company_id, product_id, warehouse_id, movement_type, quantity_delta,
      balance_after, reference, created_by
    ) values (
      v_company_id, v_item.product_id, v_default_warehouse_id, 'purchase', v_item.quantity,
      v_balance_after, v_purchase_number, p_actor_id
    );
  end loop;

  update public.suppliers
    set balance = balance + v_total
  where company_id = v_company_id and id = v_supplier_id;

  update public.purchase_orders
    set status = 'received', received_at = now()
  where company_id = v_company_id and id = p_purchase_order_id;

  select id into v_inventory_account_id from public.accounts where company_id = v_company_id and code = '1301' and is_active limit 1;
  select id into v_input_tax_account_id from public.accounts where company_id = v_company_id and code = '1401' and is_active limit 1;
  select id into v_ap_account_id from public.accounts where company_id = v_company_id and code = '2101' and is_active limit 1;
  if v_inventory_account_id is null or v_ap_account_id is null or (v_tax_amount > 0 and v_input_tax_account_id is null) then
    raise exception 'Required purchase accounts are not configured';
  end if;

  v_journal_number := public.next_document_number(v_company_id, 'journal', 'JE');
  insert into public.journal_entries (
    company_id, journal_number, entry_date, description, status,
    total_debit, total_credit, created_by, posted_at
  ) values (
    v_company_id, v_journal_number, current_date, 'استلام أمر شراء ' || v_purchase_number, 'posted',
    v_total, v_total, p_actor_id, now()
  ) returning id into v_journal_id;

  insert into public.journal_lines (company_id, journal_entry_id, account_id, description, debit, credit)
  values
    (v_company_id, v_journal_id, v_inventory_account_id, 'مخزون أمر شراء ' || v_purchase_number, v_subtotal, 0),
    (v_company_id, v_journal_id, v_ap_account_id, 'ذمة مورد ' || v_purchase_number, 0, v_total);

  if v_tax_amount > 0 then
    insert into public.journal_lines (company_id, journal_entry_id, account_id, description, debit, credit)
    values (v_company_id, v_journal_id, v_input_tax_account_id, 'ضريبة مدخلات ' || v_purchase_number, v_tax_amount, 0);
  end if;

  update public.accounts set balance = balance + v_subtotal where company_id = v_company_id and id = v_inventory_account_id;
  if v_tax_amount > 0 then update public.accounts set balance = balance + v_tax_amount where company_id = v_company_id and id = v_input_tax_account_id; end if;
  update public.accounts set balance = balance + v_total where company_id = v_company_id and id = v_ap_account_id;

  insert into public.audit_logs (company_id, actor_id, action, entity_type, entity_id, metadata)
  values (v_company_id, p_actor_id, 'received_purchase_order', 'purchase_order', p_purchase_order_id,
    jsonb_build_object('purchase_number', v_purchase_number, 'supplier_id', v_supplier_id, 'total', v_total, 'journal_entry_id', v_journal_id));

  return jsonb_build_object('purchase_order_id', p_purchase_order_id, 'purchase_number', v_purchase_number, 'total', v_total);
end;
$$;

revoke all on function public.create_purchase_order(uuid, uuid, date, date, text, numeric, text, jsonb) from public, anon, authenticated;
revoke all on function public.receive_purchase_order(uuid, uuid) from public, anon, authenticated;
grant execute on function public.create_purchase_order(uuid, uuid, date, date, text, numeric, text, jsonb) to service_role;
grant execute on function public.receive_purchase_order(uuid, uuid) to service_role;

commit;
