begin;

create or replace function public.create_supplier(
  p_actor_id uuid,
  p_name text,
  p_email text,
  p_phone text,
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
  v_supplier_id uuid;
  v_ap_account_id uuid;
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

  if v_role not in ('owner', 'admin', 'accountant') then
    raise exception 'Actor is not allowed to create suppliers';
  end if;

  if char_length(btrim(coalesce(p_name, ''))) < 1 or char_length(btrim(p_name)) > 180 then
    raise exception 'Invalid supplier name';
  end if;

  if p_opening_balance is null or p_opening_balance < 0 then
    raise exception 'Opening balance must be zero or greater';
  end if;

  if p_status not in ('active', 'inactive') then
    raise exception 'Invalid supplier status';
  end if;

  insert into public.suppliers (
    company_id, name, email, phone, balance, status, notes
  ) values (
    v_company_id,
    btrim(p_name),
    btrim(coalesce(p_email, '')),
    btrim(coalesce(p_phone, '')),
    p_opening_balance,
    p_status,
    btrim(coalesce(p_notes, ''))
  ) returning id into v_supplier_id;

  if p_opening_balance > 0 then
    select id into v_ap_account_id
    from public.accounts
    where company_id = v_company_id and code = '2101' and is_active
    limit 1;

    select id into v_capital_account_id
    from public.accounts
    where company_id = v_company_id and code = '3101' and is_active
    limit 1;

    if v_ap_account_id is null or v_capital_account_id is null then
      raise exception 'Required opening supplier balance accounts are not configured';
    end if;

    v_journal_number := public.next_document_number(v_company_id, 'journal', 'JE');

    insert into public.journal_entries (
      company_id, journal_number, entry_date, description, status,
      total_debit, total_credit, created_by, posted_at
    ) values (
      v_company_id,
      v_journal_number,
      current_date,
      'Opening payable for ' || btrim(p_name),
      'posted',
      p_opening_balance,
      p_opening_balance,
      p_actor_id,
      now()
    ) returning id into v_journal_id;

    insert into public.journal_lines (
      company_id, journal_entry_id, account_id, description, debit, credit
    ) values
      (v_company_id, v_journal_id, v_capital_account_id, 'Opening supplier balance equity', p_opening_balance, 0),
      (v_company_id, v_journal_id, v_ap_account_id, 'Opening supplier payable', 0, p_opening_balance);

    update public.accounts
      set balance = balance - p_opening_balance
    where company_id = v_company_id and id = v_capital_account_id;

    update public.accounts
      set balance = balance + p_opening_balance
    where company_id = v_company_id and id = v_ap_account_id;
  end if;

  insert into public.audit_logs (
    company_id, actor_id, action, entity_type, entity_id, metadata
  ) values (
    v_company_id,
    p_actor_id,
    'created_supplier',
    'supplier',
    v_supplier_id,
    jsonb_build_object('opening_balance', p_opening_balance, 'status', p_status)
  );

  return jsonb_build_object('supplier_id', v_supplier_id);
end;
$$;

revoke all on function public.create_supplier(uuid, text, text, text, numeric, text, text)
  from public, anon, authenticated;
grant execute on function public.create_supplier(uuid, text, text, text, numeric, text, text)
  to service_role;

commit;
