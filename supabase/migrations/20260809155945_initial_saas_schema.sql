begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  plan text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete restrict,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
  role text not null default 'employee' check (role in ('owner', 'admin', 'accountant', 'employee')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_company_id_idx on public.profiles (company_id);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id)
);

create unique index categories_company_name_key on public.categories (company_id, lower(name));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category_id uuid,
  name text not null check (char_length(btrim(name)) between 1 and 180),
  sku text not null check (char_length(btrim(sku)) between 1 and 80),
  description text not null default '',
  cost numeric(18, 2) not null default 0 check (cost >= 0),
  price numeric(18, 2) not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id),
  foreign key (company_id, category_id) references public.categories(company_id, id) on delete restrict
);

create unique index products_company_sku_key on public.products (company_id, lower(sku));
create index products_company_name_idx on public.products (company_id, lower(name));
create index products_company_category_idx on public.products (company_id, category_id);
create index products_low_stock_idx on public.products (company_id, stock, low_stock_threshold) where is_active;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 180),
  email text not null default '',
  phone text not null default '',
  tax_number text not null default '',
  address text not null default '',
  balance numeric(18, 2) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id)
);

create index customers_company_name_idx on public.customers (company_id, lower(name));
create index customers_company_phone_idx on public.customers (company_id, phone);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 180),
  email text not null default '',
  phone text not null default '',
  balance numeric(18, 2) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id)
);

create index suppliers_company_name_idx on public.suppliers (company_id, lower(name));

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null,
  invoice_number text not null,
  issue_date date not null default current_date,
  payment_method text not null default 'cash' check (payment_method in ('cash', 'bank', 'card', 'credit')),
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  notes text not null default '',
  subtotal numeric(18, 2) not null default 0 check (subtotal >= 0),
  tax_rate numeric(7, 4) not null default 0 check (tax_rate between 0 and 100),
  tax_amount numeric(18, 2) not null default 0 check (tax_amount >= 0),
  total numeric(18, 2) not null default 0 check (total >= 0),
  created_by uuid not null references auth.users(id) on delete restrict default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id),
  unique (company_id, invoice_number),
  foreign key (company_id, customer_id) references public.customers(company_id, id) on delete restrict
);

create index invoices_company_issue_date_idx on public.invoices (company_id, issue_date desc);
create index invoices_company_customer_idx on public.invoices (company_id, customer_id, issue_date desc);
create index invoices_company_status_idx on public.invoices (company_id, status, issue_date desc);
create index invoices_created_by_idx on public.invoices (created_by);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_id uuid not null,
  product_id uuid not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(18, 2) not null check (unit_price >= 0),
  unit_cost numeric(18, 2) not null default 0 check (unit_cost >= 0),
  total numeric(18, 2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now(),
  unique (company_id, id),
  foreign key (company_id, invoice_id) references public.invoices(company_id, id) on delete cascade,
  foreign key (company_id, product_id) references public.products(company_id, id) on delete restrict
);

create index invoice_items_company_invoice_idx on public.invoice_items (company_id, invoice_id);
create index invoice_items_company_product_idx on public.invoice_items (company_id, product_id);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_id uuid not null,
  invoice_id uuid,
  movement_type text not null check (movement_type in ('opening', 'sale', 'adjustment', 'purchase')),
  quantity_delta integer not null check (quantity_delta <> 0),
  balance_after integer not null check (balance_after >= 0),
  reference text not null default '',
  created_by uuid not null references auth.users(id) on delete restrict default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (company_id, product_id) references public.products(company_id, id) on delete restrict,
  foreign key (company_id, invoice_id) references public.invoices(company_id, id) on delete restrict
);

create index inventory_movements_company_product_idx on public.inventory_movements (company_id, product_id, created_at desc);
create index inventory_movements_company_created_idx on public.inventory_movements (company_id, created_at desc);
create index inventory_movements_company_invoice_idx on public.inventory_movements (company_id, invoice_id) where invoice_id is not null;
create index inventory_movements_created_by_idx on public.inventory_movements (created_by);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  supplier_id uuid,
  category text not null,
  description text not null,
  amount numeric(18, 2) not null check (amount > 0),
  expense_date date not null default current_date,
  status text not null default 'paid' check (status in ('paid', 'pending')),
  created_by uuid not null references auth.users(id) on delete restrict default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (company_id, supplier_id) references public.suppliers(company_id, id) on delete restrict
);

create index expenses_company_date_idx on public.expenses (company_id, expense_date desc);
create index expenses_company_supplier_idx on public.expenses (company_id, supplier_id, expense_date desc);
create index expenses_created_by_idx on public.expenses (created_by);

create or replace function private.user_company_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select company_id from public.profiles where id = (select auth.uid())
$$;

create or replace function private.user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_company_id uuid;
  company_name text;
  owner_name text;
begin
  company_name := coalesce(nullif(btrim(new.raw_user_meta_data ->> 'company_name'), ''), 'My Company');
  owner_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Owner'
  );

  insert into public.companies (name)
  values (company_name)
  returning id into new_company_id;

  insert into public.profiles (id, company_id, full_name, role)
  values (new.id, new_company_id, owner_name, 'owner');

  insert into public.categories (company_id, name, description)
  values
    (new_company_id, 'عام', 'التصنيف الافتراضي'),
    (new_company_id, 'أجهزة', 'الأجهزة والمعدات'),
    (new_company_id, 'إكسسوارات', 'الملحقات والإكسسوارات');

  return new;
end;
$$;

revoke all on function private.user_company_id() from public, anon;
revoke all on function private.user_role() from public, anon;
revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.handle_new_user() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.user_company_id() to authenticated;
grant execute on function private.user_role() to authenticated;

create trigger companies_set_updated_at before update on public.companies for each row execute function private.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles for each row execute function private.set_updated_at();
create trigger categories_set_updated_at before update on public.categories for each row execute function private.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute function private.set_updated_at();
create trigger customers_set_updated_at before update on public.customers for each row execute function private.set_updated_at();
create trigger suppliers_set_updated_at before update on public.suppliers for each row execute function private.set_updated_at();
create trigger invoices_set_updated_at before update on public.invoices for each row execute function private.set_updated_at();
create trigger expenses_set_updated_at before update on public.expenses for each row execute function private.set_updated_at();
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.suppliers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.expenses enable row level security;

create policy companies_select_own on public.companies for select to authenticated
using (id = (select private.user_company_id()));
create policy companies_update_owner_admin on public.companies for update to authenticated
using (id = (select private.user_company_id()) and (select private.user_role()) in ('owner', 'admin'))
with check (id = (select private.user_company_id()) and (select private.user_role()) in ('owner', 'admin'));

create policy profiles_select_company on public.profiles for select to authenticated
using (company_id = (select private.user_company_id()));
create policy profiles_update_self on public.profiles for update to authenticated
using (id = (select auth.uid()) and company_id = (select private.user_company_id()))
with check (id = (select auth.uid()) and company_id = (select private.user_company_id()));

create policy categories_select_company on public.categories for select to authenticated using (company_id = (select private.user_company_id()));
create policy categories_insert_company on public.categories for insert to authenticated with check (company_id = (select private.user_company_id()));
create policy categories_update_company on public.categories for update to authenticated using (company_id = (select private.user_company_id())) with check (company_id = (select private.user_company_id()));
create policy categories_delete_company on public.categories for delete to authenticated using (company_id = (select private.user_company_id()));

create policy products_select_company on public.products for select to authenticated using (company_id = (select private.user_company_id()));
create policy products_insert_company on public.products for insert to authenticated with check (company_id = (select private.user_company_id()));
create policy products_update_company on public.products for update to authenticated using (company_id = (select private.user_company_id())) with check (company_id = (select private.user_company_id()));
create policy products_delete_company on public.products for delete to authenticated using (company_id = (select private.user_company_id()));

create policy customers_select_company on public.customers for select to authenticated using (company_id = (select private.user_company_id()));
create policy customers_insert_company on public.customers for insert to authenticated with check (company_id = (select private.user_company_id()));
create policy customers_update_company on public.customers for update to authenticated using (company_id = (select private.user_company_id())) with check (company_id = (select private.user_company_id()));
create policy customers_delete_company on public.customers for delete to authenticated using (company_id = (select private.user_company_id()));

create policy suppliers_select_company on public.suppliers for select to authenticated using (company_id = (select private.user_company_id()));
create policy suppliers_insert_company on public.suppliers for insert to authenticated with check (company_id = (select private.user_company_id()));
create policy suppliers_update_company on public.suppliers for update to authenticated using (company_id = (select private.user_company_id())) with check (company_id = (select private.user_company_id()));
create policy suppliers_delete_company on public.suppliers for delete to authenticated using (company_id = (select private.user_company_id()));

create policy invoices_select_company on public.invoices for select to authenticated using (company_id = (select private.user_company_id()));
create policy invoices_insert_company on public.invoices for insert to authenticated with check (company_id = (select private.user_company_id()) and created_by = (select auth.uid()));
create policy invoices_update_company on public.invoices for update to authenticated using (company_id = (select private.user_company_id())) with check (company_id = (select private.user_company_id()));
create policy invoices_delete_company on public.invoices for delete to authenticated using (company_id = (select private.user_company_id()));

create policy invoice_items_select_company on public.invoice_items for select to authenticated using (company_id = (select private.user_company_id()));
create policy invoice_items_insert_company on public.invoice_items for insert to authenticated with check (company_id = (select private.user_company_id()));
create policy invoice_items_update_company on public.invoice_items for update to authenticated using (company_id = (select private.user_company_id())) with check (company_id = (select private.user_company_id()));
create policy invoice_items_delete_company on public.invoice_items for delete to authenticated using (company_id = (select private.user_company_id()));

create policy inventory_movements_select_company on public.inventory_movements for select to authenticated using (company_id = (select private.user_company_id()));
create policy inventory_movements_insert_company on public.inventory_movements for insert to authenticated with check (company_id = (select private.user_company_id()) and created_by = (select auth.uid()));

create policy expenses_select_company on public.expenses for select to authenticated using (company_id = (select private.user_company_id()));
create policy expenses_insert_company on public.expenses for insert to authenticated with check (company_id = (select private.user_company_id()) and created_by = (select auth.uid()));
create policy expenses_update_company on public.expenses for update to authenticated using (company_id = (select private.user_company_id())) with check (company_id = (select private.user_company_id()));
create policy expenses_delete_company on public.expenses for delete to authenticated using (company_id = (select private.user_company_id()));

revoke all on public.companies, public.profiles, public.categories, public.products, public.customers, public.suppliers, public.invoices, public.invoice_items, public.inventory_movements, public.expenses from anon, authenticated;
grant usage on schema public to authenticated, service_role;
grant select on public.companies, public.profiles to authenticated;
grant update (name) on public.companies to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.categories, public.products, public.customers, public.suppliers, public.invoices, public.invoice_items, public.expenses to authenticated;
grant select, insert on public.inventory_movements to authenticated;
grant all on public.companies, public.profiles, public.categories, public.products, public.customers, public.suppliers, public.invoices, public.invoice_items, public.inventory_movements, public.expenses to service_role;

commit;
