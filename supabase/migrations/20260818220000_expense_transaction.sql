begin;

create or replace function public.post_expense(
  p_actor_id uuid,
  p_category text,
  p_description text,
  p_amount numeric,
  p_expense_date date,
  p_status text,
  p_supplier_id uuid,
  p_payment_method text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_role text;
  v_expense_id uuid;
  v_supplier_name text;
  v_expense_account_id uuid;
  v_credit_account_id uuid;
  v_journal_id uuid;
  v_journal_number text;
begin
  select company_id, role into v_company_id, v_role from public.profiles where id = p_actor_id;
  if v_company_id is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if v_role not in ('owner', 'admin', 'accountant') then raise exception 'Actor is not allowed to post expenses'; end if;
  if char_length(btrim(coalesce(p_category, ''))) < 1 or char_length(btrim(p_category)) > 120 then raise exception 'Invalid expense category'; end if;
  if char_length(btrim(coalesce(p_description, ''))) < 1 or char_length(btrim(p_description)) > 1000 then raise exception 'Invalid expense description'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Expense amount must be greater than zero'; end if;
  if p_expense_date is null then raise exception 'Expense date is required'; end if;
  if p_status not in ('paid', 'pending') then raise exception 'Invalid expense status'; end if;
  if p_status = 'paid' and p_payment_method not in ('cash', 'bank', 'card') then raise exception 'Paid expense requires cash, bank, or card method'; end if;
  if p_status = 'pending' and p_supplier_id is null then raise exception 'Pending expense requires a supplier'; end if;

  if p_supplier_id is not null then
    select name into v_supplier_name
    from public.suppliers
    where company_id = v_company_id and id = p_supplier_id and status = 'active'
    for update;
    if v_supplier_name is null then raise exception 'Supplier not found or inactive'; end if;
  end if;

  insert into public.expenses (
    company_id, supplier_id, category, description, amount, expense_date, status, created_by
  ) values (
    v_company_id, p_supplier_id, btrim(p_category), btrim(p_description), p_amount, p_expense_date, p_status, p_actor_id
  ) returning id into v_expense_id;

  if p_status = 'pending' then
    update public.suppliers set balance = balance + p_amount
    where company_id = v_company_id and id = p_supplier_id;
  end if;

  select id into v_expense_account_id from public.accounts where company_id = v_company_id and code = '5201' and is_active limit 1;
  select id into v_credit_account_id from public.accounts where company_id = v_company_id and code = case when p_status = 'pending' then '2101' when p_payment_method = 'cash' then '1101' else '1102' end and is_active limit 1;
  if v_expense_account_id is null or v_credit_account_id is null then raise exception 'Required expense accounts are not configured'; end if;

  v_journal_number := public.next_document_number(v_company_id, 'journal', 'JE');
  insert into public.journal_entries (
    company_id, journal_number, entry_date, description, status,
    total_debit, total_credit, created_by, posted_at
  ) values (
    v_company_id, v_journal_number, p_expense_date, 'مصروف: ' || btrim(p_description), 'posted',
    p_amount, p_amount, p_actor_id, now()
  ) returning id into v_journal_id;

  insert into public.journal_lines (company_id, journal_entry_id, account_id, description, debit, credit)
  values
    (v_company_id, v_journal_id, v_expense_account_id, btrim(p_description), p_amount, 0),
    (v_company_id, v_journal_id, v_credit_account_id, case when p_status = 'pending' then 'ذمة مورد' else 'دفع مصروف' end, 0, p_amount);

  update public.accounts set balance = balance + p_amount where company_id = v_company_id and id = v_expense_account_id;
  if p_status = 'pending' then
    update public.accounts set balance = balance + p_amount where company_id = v_company_id and id = v_credit_account_id;
  else
    update public.accounts set balance = balance - p_amount where company_id = v_company_id and id = v_credit_account_id;
  end if;

  insert into public.audit_logs (company_id, actor_id, action, entity_type, entity_id, metadata)
  values (v_company_id, p_actor_id, 'posted_expense', 'expense', v_expense_id,
    jsonb_build_object('amount', p_amount, 'status', p_status, 'supplier_id', p_supplier_id, 'payment_method', p_payment_method, 'journal_entry_id', v_journal_id));

  return jsonb_build_object('expense_id', v_expense_id, 'amount', p_amount);
end;
$$;

revoke all on function public.post_expense(uuid, text, text, numeric, date, text, uuid, text) from public, anon, authenticated;
grant execute on function public.post_expense(uuid, text, text, numeric, date, text, uuid, text) to service_role;

commit;
