begin;

create or replace function private.seed_purchase_tax_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.accounts (company_id, code, name, account_type)
  values (new.id, '1401', 'ضريبة مدخلات قابلة للاسترداد', 'asset')
  on conflict (company_id, code) do nothing;
  return new;
end;
$$;

revoke all on function private.seed_purchase_tax_account() from public, anon, authenticated;

drop trigger if exists seed_purchase_tax_account_after_company_insert on public.companies;
create trigger seed_purchase_tax_account_after_company_insert
after insert on public.companies
for each row execute function private.seed_purchase_tax_account();

commit;
