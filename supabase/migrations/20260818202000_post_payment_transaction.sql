begin;

create or replace function public.post_payment(
  p_actor_id uuid,
  p_direction text,
  p_party_id uuid,
  p_payment_date date,
  p_method text,
  p_amount numeric,
  p_reference text,
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
  v_party_name text;
  v_party_balance numeric(20,4);
  v_payment_id uuid;
  v_payment_number text;
  v_cash_account_id uuid;
  v_counterparty_account_id uuid;
  v_journal_id uuid;
  v_journal_number text;
  v_doc_type text;
  v_prefix text;
begin
  select profile.company_id, profile.role
    into v_company_id, v_role
  from public.profiles profile
  where profile.id = p_actor_id;

  if v_company_id is null then
    raise exception 'Authenticated actor is not linked to a company';
  end if;

  if v_role not in ('owner', 'admin', 'accountant', 'sales') then
    raise exception 'Actor is not allowed to post payments';
  end if;

  if p_direction not in ('receipt', 'payment') then
    raise exception 'Invalid payment direction';
  end if;

  if p_method not in ('cash', 'bank', 'card') then
    raise exception 'Production receipts/payments require cash, bank, or card method';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be greater than zero';
  end if;

  if p_payment_date is null then
    raise exception 'Payment date is required';
  end if;

  if p_direction = 'receipt' then
    select customer.name, customer.balance
      into v_party_name, v_party_balance
    from public.customers customer
    where customer.company_id = v_company_id
      and customer.id = p_party_id
      and customer.status = 'active'
    for update;

    if v_party_name is null then
      raise exception 'Customer not found or inactive';
    end if;

    if p_amount > v_party_balance then
      raise exception 'Receipt amount exceeds customer outstanding balance';
    end if;

    update public.customers
      set balance = balance - p_amount
    where company_id = v_company_id and id = p_party_id;

    v_counterparty_account_id := (
      select id from public.accounts
      where company_id = v_company_id and code = '1201' and is_active
      limit 1
    );
    v_doc_type := 'receipt';
    v_prefix := 'RCPT';
  else
    select supplier.name, supplier.balance
      into v_party_name, v_party_balance
    from public.suppliers supplier
    where supplier.company_id = v_company_id
      and supplier.id = p_party_id
      and supplier.status = 'active'
    for update;

    if v_party_name is null then
      raise exception 'Supplier not found or inactive';
    end if;

    if p_amount > v_party_balance then
      raise exception 'Payment amount exceeds supplier payable balance';
    end if;

    update public.suppliers
      set balance = balance - p_amount
    where company_id = v_company_id and id = p_party_id;

    v_counterparty_account_id := (
      select id from public.accounts
      where company_id = v_company_id and code = '2101' and is_active
      limit 1
    );
    v_doc_type := 'payment';
    v_prefix := 'PAY';
  end if;

  v_cash_account_id := (
    select id from public.accounts
    where company_id = v_company_id
      and code = case when p_method = 'cash' then '1101' else '1102' end
      and is_active
    limit 1
  );

  if v_cash_account_id is null or v_counterparty_account_id is null then
    raise exception 'Required payment accounts are not configured';
  end if;

  v_payment_number := public.next_document_number(v_company_id, v_doc_type, v_prefix);

  insert into public.payments (
    company_id,
    payment_number,
    direction,
    party_type,
    customer_id,
    supplier_id,
    party_name,
    payment_date,
    method,
    amount,
    reference,
    notes,
    created_by
  ) values (
    v_company_id,
    v_payment_number,
    p_direction,
    case when p_direction = 'receipt' then 'customer' else 'supplier' end,
    case when p_direction = 'receipt' then p_party_id else null end,
    case when p_direction = 'payment' then p_party_id else null end,
    v_party_name,
    p_payment_date,
    p_method,
    p_amount,
    left(coalesce(p_reference, ''), 500),
    left(coalesce(p_notes, ''), 2000),
    p_actor_id
  ) returning id into v_payment_id;

  v_journal_number := public.next_document_number(v_company_id, 'journal', 'JE');

  insert into public.journal_entries (
    company_id,
    journal_number,
    entry_date,
    description,
    status,
    total_debit,
    total_credit,
    created_by,
    posted_at
  ) values (
    v_company_id,
    v_journal_number,
    p_payment_date,
    case when p_direction = 'receipt' then 'سند قبض ' else 'سند صرف ' end || v_payment_number,
    'posted',
    p_amount,
    p_amount,
    p_actor_id,
    now()
  ) returning id into v_journal_id;

  if p_direction = 'receipt' then
    insert into public.journal_lines (company_id, journal_entry_id, account_id, description, debit, credit)
    values
      (v_company_id, v_journal_id, v_cash_account_id, 'تحصيل ' || v_payment_number, p_amount, 0),
      (v_company_id, v_journal_id, v_counterparty_account_id, 'تخفيض ذمة عميل ' || v_payment_number, 0, p_amount);

    update public.accounts set balance = balance + p_amount
    where company_id = v_company_id and id = v_cash_account_id;
    update public.accounts set balance = balance - p_amount
    where company_id = v_company_id and id = v_counterparty_account_id;
  else
    insert into public.journal_lines (company_id, journal_entry_id, account_id, description, debit, credit)
    values
      (v_company_id, v_journal_id, v_counterparty_account_id, 'تخفيض ذمة مورد ' || v_payment_number, p_amount, 0),
      (v_company_id, v_journal_id, v_cash_account_id, 'صرف ' || v_payment_number, 0, p_amount);

    update public.accounts set balance = balance - p_amount
    where company_id = v_company_id and id = v_counterparty_account_id;
    update public.accounts set balance = balance - p_amount
    where company_id = v_company_id and id = v_cash_account_id;
  end if;

  insert into public.audit_logs (company_id, actor_id, action, entity_type, entity_id, metadata)
  values (
    v_company_id,
    p_actor_id,
    case when p_direction = 'receipt' then 'posted_receipt' else 'posted_supplier_payment' end,
    'payment',
    v_payment_id,
    jsonb_build_object(
      'payment_number', v_payment_number,
      'direction', p_direction,
      'party_id', p_party_id,
      'amount', p_amount,
      'method', p_method,
      'journal_entry_id', v_journal_id
    )
  );

  return jsonb_build_object(
    'payment_id', v_payment_id,
    'payment_number', v_payment_number,
    'amount', p_amount
  );
end;
$$;

revoke all on function public.post_payment(uuid, text, uuid, date, text, numeric, text, text)
  from public, anon, authenticated;
grant execute on function public.post_payment(uuid, text, uuid, date, text, numeric, text, text)
  to service_role;

commit;
