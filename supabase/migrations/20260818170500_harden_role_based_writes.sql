begin;

-- Harden browser-side CRUD permissions for non-financial master data.
-- Financial mutations remain server-only as established by the launch migration.

-- Categories: inventory administration only.
drop policy if exists categories_insert_company on public.categories;
drop policy if exists categories_update_company on public.categories;
drop policy if exists categories_delete_company on public.categories;

create policy categories_insert_company_role on public.categories
for insert to authenticated
with check (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin', 'inventory')
);

create policy categories_update_company_role on public.categories
for update to authenticated
using (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin', 'inventory')
)
with check (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin', 'inventory')
);

create policy categories_delete_company_role on public.categories
for delete to authenticated
using (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin', 'inventory')
);

-- Products: inventory administration only.
drop policy if exists products_insert_company on public.products;
drop policy if exists products_update_company on public.products;
drop policy if exists products_delete_company on public.products;

create policy products_insert_company_role on public.products
for insert to authenticated
with check (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin', 'inventory')
);

create policy products_update_company_role on public.products
for update to authenticated
using (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin', 'inventory')
)
with check (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin', 'inventory')
);

create policy products_delete_company_role on public.products
for delete to authenticated
using (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin', 'inventory')
);

-- Customers: commercial/accounting administration.
drop policy if exists customers_insert_company on public.customers;
drop policy if exists customers_update_company on public.customers;
drop policy if exists customers_delete_company on public.customers;

create policy customers_insert_company_role on public.customers
for insert to authenticated
with check (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin', 'accountant', 'sales')
);

create policy customers_update_company_role on public.customers
for update to authenticated
using (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin', 'accountant', 'sales')
)
with check (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin', 'accountant', 'sales')
);

create policy customers_delete_company_role on public.customers
for delete to authenticated
using (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin')
);

-- Suppliers: accounting/procurement administration.
drop policy if exists suppliers_insert_company on public.suppliers;
drop policy if exists suppliers_update_company on public.suppliers;
drop policy if exists suppliers_delete_company on public.suppliers;

create policy suppliers_insert_company_role on public.suppliers
for insert to authenticated
with check (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin', 'accountant', 'inventory')
);

create policy suppliers_update_company_role on public.suppliers
for update to authenticated
using (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin', 'accountant', 'inventory')
)
with check (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin', 'accountant', 'inventory')
);

create policy suppliers_delete_company_role on public.suppliers
for delete to authenticated
using (
  company_id = (select private.user_company_id())
  and (select private.user_role()) in ('owner', 'admin')
);

commit;
