begin;

create table if not exists public.accounting_period_locks (
  company_id uuid primary key references public.companies(id) on delete cascade,
  locked_through date,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.accounting_period_locks enable row level security;
revoke all on public.accounting_period_locks from anon, authenticated;
grant select on public.accounting_period_locks to authenticated;
grant all on public.accounting_period_locks to service_role;

drop policy if exists accounting_period_locks_select_company on public.accounting_period_locks;
create policy accounting_period_locks_select_company
on public.accounting_period_locks for select to authenticated
using (company_id = (select private.user_company_id()));

create or replace function private.enforce_accounting_period_lock()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_locked_through date;
begin
  select locked_through into v_locked_through
  from public.accounting_period_locks
  where company_id = new.company_id;

  if v_locked_through is not null and new.entry_date <= v_locked_through then
    raise exception 'Accounting period is locked through %', v_locked_through;
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_accounting_period_lock() from public, anon, authenticated;

drop trigger if exists journal_entries_enforce_period_lock on public.journal_entries;
create trigger journal_entries_enforce_period_lock
before insert on public.journal_entries
for each row execute function private.enforce_accounting_period_lock();

commit;
