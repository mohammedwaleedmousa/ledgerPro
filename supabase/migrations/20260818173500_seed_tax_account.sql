begin;

create or replace function private.seed_tax_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.accounts (company_id, code, name, account_type)
  values (new.id, '2201', 'ضريبة المبيعات المستحقة', 'liability')
  on conflict (company_id, code) do nothing;
  return new;
end;
$$;

revoke all on function private.seed_tax_account() from public, anon, authenticated;

drop trigger if exists companies_seed_tax_account on public.companies;
create trigger companies_seed_tax_account
after insert on public.companies
for each row execute function private.seed_tax_account();

commit;
