begin;

insert into public.accounts (company_id, code, name, account_type)
select company.id, seed.code, seed.name, seed.account_type
from public.companies company
cross join (values
  ('4201', 'مكاسب تسوية المخزون', 'revenue'),
  ('5301', 'خسائر وفروقات المخزون', 'expense')
) as seed(code, name, account_type)
on conflict (company_id, code) do nothing;

create or replace function private.seed_inventory_adjustment_accounts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.accounts (company_id, code, name, account_type)
  values
    (new.id, '4201', 'مكاسب تسوية المخزون', 'revenue'),
    (new.id, '5301', 'خسائر وفروقات المخزون', 'expense')
  on conflict (company_id, code) do nothing;
  return new;
end;
$$;

revoke all on function private.seed_inventory_adjustment_accounts() from public, anon, authenticated;

drop trigger if exists seed_inventory_adjustment_accounts_after_company_insert on public.companies;
create trigger seed_inventory_adjustment_accounts_after_company_insert
after insert on public.companies
for each row execute function private.seed_inventory_adjustment_accounts();

commit;
