begin;

create or replace function public.create_customer(
  p_actor_id uuid,
  p_name text,
  p_email text,
  p_phone text,
  p_tax_number text,
  p_address text,
  p_opening_balance numeric,
  p_status text,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_role text;
  v_customer_id uuid;
  v_ar_account_id uuid;
  v_capital_account_id uuid;
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
    raise exception 'Actor is not allowed to create customers';
  end if;

  if char_length(btrim(coalesce(p_name, ''))) < 1 or char_length(btrim(p_name)) > 180 then
    raise exception 'Invalid customer name';
  end if;

  if p_opening_balance is null or p_opening_balance < 0 then
    raise exception 'Opening balance must be zero or greater';
  end if;

  if p_status not in ('active', 'inactive') then
    raise exception 'Invalid customer status';
  end if;

  insert into public.customers (
    company_id, name, email, phone, tax_number, address, balance, status, notes
  ) values (
    v_company_id,
    btrim(p_name),
    btrim(coalesce(p_email, '')),
    btrim(coalesce(p_phone, '')),
    btrim(coalesce(p_tax_number, '')),
    btrim(coalesce(p_address, '')),
    p_opening_balance,
    p_status,
    btrim(coalesce(p_notes, ''))
  ) returning id into v_customer_id;

  if p_opening_balance > 0 then
    select id into v_ar_account_id
    from public.accounts
    where company_id = v_company_id and code = '1201' and is_active
    limit 1;

    select id into v_capital_account_id
    from public.accounts
    where company_id = v_company_id and code = '3101' and is_active
    limit 1;

    if v_ar_account_id is null or v_capital_account_id is null then
      raise exception 'Required opening balance accounts are not configured';
    end if;

    v_journal_number := public.next_document_number(v_company_id, 'journal', 'JE');

    insert into public.journal_entries (
      company_id, journal_number, entry_date, description, status,
      total_debit, total_credit, created_by, posted_at
    ) values (
      v_company_id,
      v_journal_number,
      current_date,
      'Opening receivable for ' || btrim(p_name),
      'posted',
      p_opening_balance,
      p_opening_balance,
      p_actor_id,
      now()
    ) returning id into v_journal_id;

    insert into public.journal_lines (
      company_id, journal_entry_id, account_id, description, debit, credit
    ) values
      (v_company_id, v_journal_id, v_ar_account_id, 'Opening customer receivable', p_opening_balance, 0),
      (v_company_id, v_journal_id, v_capital_account_id, 'Opening customer balance equity', 0, p_opening_balance);

    update public.accounts
      set balance = balance + p_opening_balance
    where company_id = v_company_id and id = v_ar_account_id;

    update public.accounts
      set balance = balance + p_opening_balance
    where company_id = v_company_id and id = v_capital_account_id;
  end if;

  insert into public.audit_logs (
    company_id, actor_id, action, entity_type, entity_id, metadata
  ) values (
    v_company_id,
    p_actor_id,
    'created_customer',
    'customer',
    v_customer_id,
    jsonb_build_object('opening_balance', p_opening_balance, 'status', p_status)
  );

  return jsonb_build_object('customer_id', v_customer_id);
end;
$$;

revoke all on function public.create_customer(uuid, text, text, text, text, text, numeric, text, text)
  from public, anon, authenticated;
grant execute on function public.create_customer(uuid, text, text, text, text, text, numeric, text, text)
  to service_role;

commit;
