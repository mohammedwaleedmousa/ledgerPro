begin;

create unique index if not exists sales_returns_one_completed_per_invoice_idx
  on public.sales_returns (company_id, invoice_id)
  where status = 'completed';

create or replace function public.post_sales_return(
  p_actor_id uuid,
  p_invoice_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_role text;
  v_invoice_number text;
  v_customer_id uuid;
  v_payment_method text;
  v_subtotal numeric(18,2);
  v_tax_amount numeric(18,2);
  v_total numeric(18,2);
  v_status text;
  v_customer_balance numeric(20,4);
  v_return_id uuid;
  v_return_number text;
  v_default_warehouse_id uuid;
  v_total_cost numeric(20,4) := 0;
  v_item record;
  v_balance_after integer;
  v_refund_account_id uuid;
  v_sales_account_id uuid;
  v_tax_account_id uuid;
  v_cogs_account_id uuid;
  v_inventory_account_id uuid;
  v_journal_id uuid;
  v_journal_number text;
begin
  select company_id, role into v_company_id, v_role from public.profiles where id = p_actor_id;
  if v_company_id is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if v_role not in ('owner', 'admin', 'accountant', 'sales') then raise exception 'Actor is not allowed to post sales returns'; end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 1 or char_length(btrim(p_reason)) > 1000 then raise exception 'Return reason is required'; end if;

  select invoice_number, customer_id, payment_method, subtotal, tax_amount, total, status
    into v_invoice_number, v_customer_id, v_payment_method, v_subtotal, v_tax_amount, v_total, v_status
  from public.invoices
  where company_id = v_company_id and id = p_invoice_id
  for update;

  if v_invoice_number is null then raise exception 'Invoice not found'; end if;
  if v_status = 'draft' then raise exception 'Draft invoices cannot be returned'; end if;
  if exists (select 1 from public.sales_returns where company_id = v_company_id and invoice_id = p_invoice_id and status = 'completed') then
    raise exception 'Invoice already has a completed return';
  end if;

  if v_payment_method = 'credit' then
    select balance into v_customer_balance
    from public.customers
    where company_id = v_company_id and id = v_customer_id
    for update;
    if v_customer_balance < v_total then
      raise exception 'Credit invoice has already been collected partially or fully; refund allocation is required before return';
    end if;
  end if;

  select id into v_default_warehouse_id
  from public.warehouses
  where company_id = v_company_id and is_default and is_active
  limit 1;
  if v_default_warehouse_id is null then raise exception 'Default warehouse is not configured'; end if;

  v_return_number := public.next_document_number(v_company_id, 'return', 'RET');

  insert into public.sales_returns (
    company_id, return_number, invoice_id, customer_id, return_date,
    reason, subtotal, tax_amount, total, status, created_by
  ) values (
    v_company_id, v_return_number, p_invoice_id, v_customer_id, current_date,
    btrim(p_reason), v_subtotal, v_tax_amount, v_total, 'completed', p_actor_id
  ) returning id into v_return_id;

  for v_item in
    select id, product_id, product_name, quantity, unit_price, unit_cost
    from public.invoice_items
    where company_id = v_company_id and invoice_id = p_invoice_id
  loop
    insert into public.sales_return_items (
      company_id, sales_return_id, invoice_item_id, product_id, quantity, unit_price, unit_cost
    ) values (
      v_company_id, v_return_id, v_item.id, v_item.product_id, v_item.quantity, v_item.unit_price, v_item.unit_cost
    );

    update public.products set stock = stock + v_item.quantity
    where company_id = v_company_id and id = v_item.product_id;

    insert into public.product_inventory (company_id, warehouse_id, product_id, quantity, reserved_quantity)
    values (v_company_id, v_default_warehouse_id, v_item.product_id, v_item.quantity, 0)
    on conflict (company_id, warehouse_id, product_id)
    do update set quantity = public.product_inventory.quantity + excluded.quantity
    returning quantity into v_balance_after;

    insert into public.inventory_movements (
      company_id, product_id, invoice_id, warehouse_id, movement_type,
      quantity_delta, balance_after, reference, created_by
    ) values (
      v_company_id, v_item.product_id, p_invoice_id, v_default_warehouse_id, 'return',
      v_item.quantity, v_balance_after, v_return_number, p_actor_id
    );

    v_total_cost := v_total_cost + round(v_item.quantity * v_item.unit_cost, 4);
  end loop;

  if v_payment_method = 'credit' then
    update public.customers set balance = balance - v_total
    where company_id = v_company_id and id = v_customer_id;
  end if;

  select id into v_refund_account_id from public.accounts where company_id = v_company_id and code = case when v_payment_method = 'credit' then '1201' when v_payment_method = 'cash' then '1101' else '1102' end and is_active limit 1;
  select id into v_sales_account_id from public.accounts where company_id = v_company_id and code = '4101' and is_active limit 1;
  select id into v_tax_account_id from public.accounts where company_id = v_company_id and code = '2201' and is_active limit 1;
  select id into v_cogs_account_id from public.accounts where company_id = v_company_id and code = '5101' and is_active limit 1;
  select id into v_inventory_account_id from public.accounts where company_id = v_company_id and code = '1301' and is_active limit 1;

  if v_refund_account_id is null or v_sales_account_id is null or v_cogs_account_id is null or v_inventory_account_id is null or (v_tax_amount > 0 and v_tax_account_id is null) then
    raise exception 'Required return accounts are not configured';
  end if;

  v_journal_number := public.next_document_number(v_company_id, 'journal', 'JE');
  insert into public.journal_entries (
    company_id, journal_number, entry_date, description, status,
    total_debit, total_credit, created_by, posted_at
  ) values (
    v_company_id, v_journal_number, current_date, 'مرتجع فاتورة ' || v_invoice_number, 'posted',
    v_total + v_total_cost, v_total + v_total_cost, p_actor_id, now()
  ) returning id into v_journal_id;

  insert into public.journal_lines (company_id, journal_entry_id, account_id, description, debit, credit)
  values
    (v_company_id, v_journal_id, v_sales_account_id, 'عكس إيراد ' || v_return_number, v_subtotal, 0),
    (v_company_id, v_journal_id, v_refund_account_id, 'استرداد/تخفيض ذمة ' || v_return_number, 0, v_total),
    (v_company_id, v_journal_id, v_inventory_account_id, 'إعادة مخزون ' || v_return_number, v_total_cost, 0),
    (v_company_id, v_journal_id, v_cogs_account_id, 'عكس تكلفة مبيعات ' || v_return_number, 0, v_total_cost);

  if v_tax_amount > 0 then
    insert into public.journal_lines (company_id, journal_entry_id, account_id, description, debit, credit)
    values (v_company_id, v_journal_id, v_tax_account_id, 'عكس ضريبة ' || v_return_number, v_tax_amount, 0);
  end if;

  update public.accounts set balance = balance - v_subtotal where company_id = v_company_id and id = v_sales_account_id;
  update public.accounts set balance = balance - v_total where company_id = v_company_id and id = v_refund_account_id;
  update public.accounts set balance = balance + v_total_cost where company_id = v_company_id and id = v_inventory_account_id;
  update public.accounts set balance = balance - v_total_cost where company_id = v_company_id and id = v_cogs_account_id;
  if v_tax_amount > 0 then update public.accounts set balance = balance - v_tax_amount where company_id = v_company_id and id = v_tax_account_id; end if;

  insert into public.audit_logs (company_id, actor_id, action, entity_type, entity_id, metadata)
  values (v_company_id, p_actor_id, 'posted_sales_return', 'sales_return', v_return_id,
    jsonb_build_object('return_number', v_return_number, 'invoice_id', p_invoice_id, 'invoice_number', v_invoice_number, 'total', v_total, 'journal_entry_id', v_journal_id));

  return jsonb_build_object('sales_return_id', v_return_id, 'return_number', v_return_number, 'total', v_total);
end;
$$;

revoke all on function public.post_sales_return(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.post_sales_return(uuid, uuid, text) to service_role;

commit;
