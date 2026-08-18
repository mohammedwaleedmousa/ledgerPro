begin;

-- Tax liability account used when invoices include tax.
insert into public.accounts (company_id, code, name, account_type)
select id, '2201', 'ضريبة المبيعات المستحقة', 'liability'
from public.companies
on conflict (company_id, code) do nothing;

create or replace function public.post_invoice(
  p_actor_id uuid,
  p_customer_id uuid,
  p_issue_date date,
  p_payment_method text,
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
  v_invoice_id uuid;
  v_invoice_number text;
  v_invoice_prefix text;
  v_status text;
  v_customer_name text;
  v_default_warehouse_id uuid;
  v_subtotal numeric(18,2) := 0;
  v_tax_amount numeric(18,2) := 0;
  v_total numeric(18,2) := 0;
  v_total_cost numeric(20,4) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_product_name text;
  v_quantity integer;
  v_unit_price numeric(18,2);
  v_unit_cost numeric(18,2);
  v_stock integer;
  v_warehouse_stock integer;
  v_asset_account_id uuid;
  v_sales_account_id uuid;
  v_tax_account_id uuid;
  v_cogs_account_id uuid;
  v_inventory_account_id uuid;
  v_journal_id uuid;
  v_journal_number text;
begin
  select profile.company_id, profile.role
    into v_company_id, v_role
  from public.profiles profile
  where profile.id = p_actor_id;

  if v_company_id is null then
    raise exception 'Authenticated actor is not linked to a company';
  end if;

  if v_role not in ('owner', 'admin', 'accountant', 'sales') then
    raise exception 'Actor is not allowed to post invoices';
  end if;

  if p_payment_method not in ('cash', 'bank', 'card', 'credit') then
    raise exception 'Invalid payment method';
  end if;

  if p_tax_rate is null or p_tax_rate < 0 or p_tax_rate > 100 then
    raise exception 'Invalid tax rate';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Invoice requires at least one item';
  end if;

  select customer.name
    into v_customer_name
  from public.customers customer
  where customer.company_id = v_company_id
    and customer.id = p_customer_id
    and customer.status = 'active'
  for update;

  if v_customer_name is null then
    raise exception 'Customer not found or inactive';
  end if;

  select warehouse.id
    into v_default_warehouse_id
  from public.warehouses warehouse
  where warehouse.company_id = v_company_id
    and warehouse.is_default
    and warehouse.is_active
  limit 1;

  if v_default_warehouse_id is null then
    raise exception 'Default warehouse is not configured';
  end if;

  -- Lock and validate every product before creating any financial document.
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    begin
      v_product_id := (v_item ->> 'product_id')::uuid;
      v_quantity := (v_item ->> 'quantity')::integer;
      v_unit_price := (v_item ->> 'unit_price')::numeric;
    exception when others then
      raise exception 'Invalid invoice item payload';
    end;

    if v_quantity <= 0 or v_unit_price < 0 then
      raise exception 'Invalid invoice item quantity or price';
    end if;

    select product.name, product.cost, product.stock
      into v_product_name, v_unit_cost, v_stock
    from public.products product
    where product.company_id = v_company_id
      and product.id = v_product_id
      and product.is_active
    for update;

    if v_product_name is null then
      raise exception 'Product % not found or inactive', v_product_id;
    end if;

    select inventory.quantity
      into v_warehouse_stock
    from public.product_inventory inventory
    where inventory.company_id = v_company_id
      and inventory.warehouse_id = v_default_warehouse_id
      and inventory.product_id = v_product_id
    for update;

    if v_warehouse_stock is null then
      raise exception 'Product % is not stocked in the default warehouse', v_product_id;
    end if;

    if v_stock < v_quantity or v_warehouse_stock < v_quantity then
      raise exception 'Insufficient stock for product %', v_product_name;
    end if;

    v_subtotal := v_subtotal + round(v_quantity * v_unit_price, 2);
    v_total_cost := v_total_cost + round(v_quantity * v_unit_cost, 4);
  end loop;

  v_tax_amount := round(v_subtotal * (p_tax_rate / 100), 2);
  v_total := v_subtotal + v_tax_amount;
  v_status := case when p_payment_method = 'credit' then 'sent' else 'paid' end;

  select settings.invoice_prefix
    into v_invoice_prefix
  from public.company_settings settings
  where settings.company_id = v_company_id;

  if v_invoice_prefix is null then
    raise exception 'Company settings are missing';
  end if;

  v_invoice_number := public.next_document_number(v_company_id, 'invoice', v_invoice_prefix);

  insert into public.invoices (
    company_id, customer_id, invoice_number, issue_date, payment_method, status,
    notes, subtotal, tax_rate, tax_amount, total, created_by
  ) values (
    v_company_id, p_customer_id, v_invoice_number, p_issue_date, p_payment_method, v_status,
    coalesce(p_notes, ''), v_subtotal, p_tax_rate, v_tax_amount, v_total, p_actor_id
  ) returning id into v_invoice_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;
    v_unit_price := (v_item ->> 'unit_price')::numeric;

    select product.name, product.cost, product.stock
      into v_product_name, v_unit_cost, v_stock
    from public.products product
    where product.company_id = v_company_id and product.id = v_product_id
    for update;

    insert into public.invoice_items (
      company_id, invoice_id, product_id, product_name, quantity, unit_price, unit_cost
    ) values (
      v_company_id, v_invoice_id, v_product_id, v_product_name, v_quantity, v_unit_price, v_unit_cost
    );

    update public.products
      set stock = stock - v_quantity
    where company_id = v_company_id and id = v_product_id;

    update public.product_inventory
      set quantity = quantity - v_quantity
    where company_id = v_company_id
      and warehouse_id = v_default_warehouse_id
      and product_id = v_product_id
    returning quantity into v_warehouse_stock;

    insert into public.inventory_movements (
      company_id, product_id, invoice_id, warehouse_id, movement_type,
      quantity_delta, balance_after, reference, created_by
    ) values (
      v_company_id, v_product_id, v_invoice_id, v_default_warehouse_id, 'sale',
      -v_quantity, v_warehouse_stock, v_invoice_number, p_actor_id
    );
  end loop;

  if p_payment_method = 'credit' then
    update public.customers
      set balance = balance + v_total
    where company_id = v_company_id and id = p_customer_id;
  end if;

  select account.id into v_asset_account_id
  from public.accounts account
  where account.company_id = v_company_id
    and account.code = case
      when p_payment_method = 'credit' then '1201'
      when p_payment_method = 'cash' then '1101'
      else '1102'
    end
  limit 1;

  select id into v_sales_account_id from public.accounts where company_id = v_company_id and code = '4101' limit 1;
  select id into v_tax_account_id from public.accounts where company_id = v_company_id and code = '2201' limit 1;
  select id into v_cogs_account_id from public.accounts where company_id = v_company_id and code = '5101' limit 1;
  select id into v_inventory_account_id from public.accounts where company_id = v_company_id and code = '1301' limit 1;

  if v_asset_account_id is null or v_sales_account_id is null or v_tax_account_id is null
    or v_cogs_account_id is null or v_inventory_account_id is null then
    raise exception 'Required accounting accounts are not configured';
  end if;

  v_journal_number := public.next_document_number(v_company_id, 'journal', 'JE');

  insert into public.journal_entries (
    company_id, journal_number, entry_date, description, status,
    total_debit, total_credit, created_by, posted_at
  ) values (
    v_company_id, v_journal_number, p_issue_date,
    'ترحيل فاتورة ' || v_invoice_number, 'posted',
    v_total + v_total_cost, v_total + v_total_cost, p_actor_id, now()
  ) returning id into v_journal_id;

  insert into public.journal_lines (company_id, journal_entry_id, account_id, description, debit, credit)
  values
    (v_company_id, v_journal_id, v_asset_account_id, 'فاتورة ' || v_invoice_number, v_total, 0),
    (v_company_id, v_journal_id, v_sales_account_id, 'إيراد فاتورة ' || v_invoice_number, 0, v_subtotal),
    (v_company_id, v_journal_id, v_cogs_account_id, 'تكلفة مبيعات ' || v_invoice_number, v_total_cost, 0),
    (v_company_id, v_journal_id, v_inventory_account_id, 'صرف مخزون ' || v_invoice_number, 0, v_total_cost);

  if v_tax_amount > 0 then
    insert into public.journal_lines (company_id, journal_entry_id, account_id, description, debit, credit)
    values (v_company_id, v_journal_id, v_tax_account_id, 'ضريبة فاتورة ' || v_invoice_number, 0, v_tax_amount);
  end if;

  update public.accounts set balance = balance + v_total where company_id = v_company_id and id = v_asset_account_id;
  update public.accounts set balance = balance + v_subtotal where company_id = v_company_id and id = v_sales_account_id;
  update public.accounts set balance = balance + v_total_cost where company_id = v_company_id and id = v_cogs_account_id;
  update public.accounts set balance = balance - v_total_cost where company_id = v_company_id and id = v_inventory_account_id;
  if v_tax_amount > 0 then
    update public.accounts set balance = balance + v_tax_amount where company_id = v_company_id and id = v_tax_account_id;
  end if;

  insert into public.audit_logs (company_id, actor_id, action, entity_type, entity_id, metadata)
  values (
    v_company_id,
    p_actor_id,
    'posted_invoice',
    'invoice',
    v_invoice_id,
    jsonb_build_object(
      'invoice_number', v_invoice_number,
      'customer_id', p_customer_id,
      'payment_method', p_payment_method,
      'total', v_total,
      'journal_entry_id', v_journal_id
    )
  );

  return jsonb_build_object(
    'invoice_id', v_invoice_id,
    'invoice_number', v_invoice_number,
    'total', v_total
  );
end;
$$;

revoke all on function public.post_invoice(uuid, uuid, date, text, numeric, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.post_invoice(uuid, uuid, date, text, numeric, text, jsonb)
  to service_role;

commit;
