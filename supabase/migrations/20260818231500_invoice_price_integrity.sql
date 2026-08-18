begin;

create unique index if not exists invoice_items_one_product_per_invoice_idx
  on public.invoice_items (company_id, invoice_id, product_id);

create or replace function private.enforce_invoice_item_catalog_price()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_catalog_price numeric(18,2);
begin
  select price into v_catalog_price
  from public.products
  where company_id = new.company_id
    and id = new.product_id
    and is_active;

  if v_catalog_price is null then
    raise exception 'Product is missing or inactive';
  end if;

  if round(new.unit_price, 2) <> round(v_catalog_price, 2) then
    raise exception 'Invoice unit price must match the current catalog price';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_invoice_item_catalog_price() from public, anon, authenticated;

drop trigger if exists invoice_items_enforce_catalog_price on public.invoice_items;
create trigger invoice_items_enforce_catalog_price
before insert on public.invoice_items
for each row execute function private.enforce_invoice_item_catalog_price();

commit;
