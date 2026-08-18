begin;

alter table public.journal_entries
  add column if not exists is_manual boolean not null default false;

create or replace function public.post_manual_journal(
  p_actor_id uuid,
  p_entry_date date,
  p_description text,
  p_lines jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_role text;
  v_total_debit numeric(20,4) := 0;
  v_total_credit numeric(20,4) := 0;
  v_line jsonb;
  v_account_id uuid;
  v_account_type text;
  v_debit numeric(20,4);
  v_credit numeric(20,4);
  v_journal_id uuid;
  v_journal_number text;
begin
  select company_id, role into v_company_id, v_role
  from public.profiles where id = p_actor_id;

  if v_company_id is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if v_role not in ('owner', 'admin', 'accountant') then raise exception 'Actor is not allowed to post manual journals'; end if;
  if p_entry_date is null then raise exception 'Entry date is required'; end if;
  if char_length(btrim(coalesce(p_description, ''))) < 1 or char_length(btrim(p_description)) > 1000 then raise exception 'Invalid journal description'; end if;
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) < 2 then raise exception 'Journal requires at least two lines'; end if;

  for v_line in select value from jsonb_array_elements(p_lines)
  loop
    begin
      v_account_id := (v_line ->> 'account_id')::uuid;
      v_debit := coalesce((v_line ->> 'debit')::numeric, 0);
      v_credit := coalesce((v_line ->> 'credit')::numeric, 0);
    exception when others then
      raise exception 'Invalid journal line payload';
    end;

    if v_debit < 0 or v_credit < 0 or ((v_debit > 0)::int + (v_credit > 0)::int) <> 1 then
      raise exception 'Each journal line must contain exactly one positive debit or credit';
    end if;

    select account_type into v_account_type
    from public.accounts
    where company_id = v_company_id and id = v_account_id and is_active;
    if v_account_type is null then raise exception 'Account % not found or inactive', v_account_id; end if;

    v_total_debit := v_total_debit + v_debit;
    v_total_credit := v_total_credit + v_credit;
  end loop;

  if v_total_debit <= 0 or round(v_total_debit, 4) <> round(v_total_credit, 4) then
    raise exception 'Journal is not balanced';
  end if;

  v_journal_number := public.next_document_number(v_company_id, 'journal', 'JE');
  insert into public.journal_entries (
    company_id, journal_number, entry_date, description, status,
    total_debit, total_credit, created_by, posted_at, is_manual
  ) values (
    v_company_id, v_journal_number, p_entry_date, btrim(p_description), 'posted',
    v_total_debit, v_total_credit, p_actor_id, now(), true
  ) returning id into v_journal_id;

  for v_line in select value from jsonb_array_elements(p_lines)
  loop
    v_account_id := (v_line ->> 'account_id')::uuid;
    v_debit := coalesce((v_line ->> 'debit')::numeric, 0);
    v_credit := coalesce((v_line ->> 'credit')::numeric, 0);
    select account_type into v_account_type from public.accounts where company_id = v_company_id and id = v_account_id;

    insert into public.journal_lines (company_id, journal_entry_id, account_id, description, debit, credit)
    values (v_company_id, v_journal_id, v_account_id, btrim(p_description), v_debit, v_credit);

    update public.accounts
      set balance = balance + case
        when v_account_type in ('asset', 'expense') then v_debit - v_credit
        else v_credit - v_debit
      end
    where company_id = v_company_id and id = v_account_id;
  end loop;

  insert into public.audit_logs (company_id, actor_id, action, entity_type, entity_id, metadata)
  values (v_company_id, p_actor_id, 'posted_manual_journal', 'journal_entry', v_journal_id,
    jsonb_build_object('journal_number', v_journal_number, 'total', v_total_debit));

  return jsonb_build_object('journal_entry_id', v_journal_id, 'journal_number', v_journal_number);
end;
$$;

create or replace function public.reverse_manual_journal(
  p_actor_id uuid,
  p_journal_entry_id uuid,
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
  v_original_number text;
  v_original_date date;
  v_original_description text;
  v_total numeric(20,4);
  v_is_manual boolean;
  v_status text;
  v_reversal_id uuid;
  v_reversal_number text;
  v_line record;
  v_account_type text;
begin
  select company_id, role into v_company_id, v_role from public.profiles where id = p_actor_id;
  if v_company_id is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if v_role not in ('owner', 'admin', 'accountant') then raise exception 'Actor is not allowed to reverse journals'; end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 1 or char_length(btrim(p_reason)) > 1000 then raise exception 'Reversal reason is required'; end if;

  select journal_number, entry_date, description, total_debit, is_manual, status
    into v_original_number, v_original_date, v_original_description, v_total, v_is_manual, v_status
  from public.journal_entries
  where company_id = v_company_id and id = p_journal_entry_id
  for update;

  if v_original_number is null then raise exception 'Journal entry not found'; end if;
  if not v_is_manual then raise exception 'Only manual journal entries can be reversed from this endpoint'; end if;
  if v_status <> 'posted' then raise exception 'Only posted journal entries can be reversed'; end if;
  if exists (select 1 from public.journal_entries where company_id = v_company_id and reversal_of_id = p_journal_entry_id) then raise exception 'Journal entry is already reversed'; end if;

  v_reversal_number := public.next_document_number(v_company_id, 'journal', 'JE');
  insert into public.journal_entries (
    company_id, journal_number, entry_date, description, status,
    total_debit, total_credit, reversal_of_id, created_by, posted_at, is_manual
  ) values (
    v_company_id, v_reversal_number, current_date,
    'عكس ' || v_original_number || ': ' || btrim(p_reason), 'posted',
    v_total, v_total, p_journal_entry_id, p_actor_id, now(), true
  ) returning id into v_reversal_id;

  for v_line in
    select line.account_id, line.description, line.debit, line.credit, account.account_type
    from public.journal_lines line
    join public.accounts account on account.company_id = line.company_id and account.id = line.account_id
    where line.company_id = v_company_id and line.journal_entry_id = p_journal_entry_id
  loop
    insert into public.journal_lines (company_id, journal_entry_id, account_id, description, debit, credit)
    values (v_company_id, v_reversal_id, v_line.account_id, 'عكس: ' || v_line.description, v_line.credit, v_line.debit);

    update public.accounts
      set balance = balance + case
        when v_line.account_type in ('asset', 'expense') then v_line.credit - v_line.debit
        else v_line.debit - v_line.credit
      end
    where company_id = v_company_id and id = v_line.account_id;
  end loop;

  update public.journal_entries set status = 'reversed'
  where company_id = v_company_id and id = p_journal_entry_id;

  insert into public.audit_logs (company_id, actor_id, action, entity_type, entity_id, metadata)
  values (v_company_id, p_actor_id, 'reversed_manual_journal', 'journal_entry', p_journal_entry_id,
    jsonb_build_object('original_number', v_original_number, 'reversal_id', v_reversal_id, 'reversal_number', v_reversal_number, 'reason', btrim(p_reason)));

  return jsonb_build_object('journal_entry_id', p_journal_entry_id, 'reversal_id', v_reversal_id, 'reversal_number', v_reversal_number);
end;
$$;

revoke all on function public.post_manual_journal(uuid, date, text, jsonb) from public, anon, authenticated;
revoke all on function public.reverse_manual_journal(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.post_manual_journal(uuid, date, text, jsonb) to service_role;
grant execute on function public.reverse_manual_journal(uuid, uuid, text) to service_role;

commit;
