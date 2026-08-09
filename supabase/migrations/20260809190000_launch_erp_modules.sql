begin;

-- This migration extends the core tenant schema for the launch MVP. Financial
-- mutations are intentionally reserved for the NestJS service role so document,
-- stock, balance, and journal changes can be committed in one database transaction.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('owner', 'admin', 'accountant', 'sales', 'inventory', 'viewer', 'employee'));

create index if not exists products_company_cursor_idx
  on public.products (company_id, created_at desc, id desc);
create index if not exists customers_company_cursor_idx
  on public.customers (company_id, created_at desc, id desc);
create index if not exists suppliers_company_cursor_idx
  on public.suppliers (company_id, created_at desc, id desc);
create index if not exists invoices_company_cursor_idx
  on public.invoices (company_id, issue_date desc, id desc);

create table public.company_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,
  currency text not null default 'USD' check (currency in ('USD', 'YER', 'SAR')),
  tax_rate numeric(7, 4) not null default 0 check (tax_rate between 0 and 100),
  invoice_prefix text not null default 'INV' check (char_length(btrim(invoice_prefix)) between 1 and 12),
  quotation_prefix text not null default 'QT' check (char_length(btrim(quotation_prefix)) between 1 and 12),
  purchase_prefix text not null default 'PO' check (char_length(btrim(purchase_prefix)) between 1 and 12),
  fiscal_year_start text not null default '01-01' check (fiscal_year_start ~ '^[0-9]{2}-[0-9]{2}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.company_settings (company_id)
select id from public.companies
on conflict (company_id) do nothing;

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  location text not null default '',
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id)
);

create unique index warehouses_company_name_key on public.warehouses (company_id, lower(name));
create unique index warehouses_one_default_per_company_idx on public.warehouses (company_id) where is_default;
create index warehouses_company_active_idx on public.warehouses (company_id, is_active, created_at desc);

insert into public.warehouses (company_id, name, is_default)
select id, 'المستودع الرئيسي', true from public.companies
on conflict do nothing;

create table public.product_inventory (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  warehouse_id uuid not null,
  product_id uuid not null,
  quantity integer not null default 0 check (quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0 and reserved_quantity <= quantity),
  updated_at timestamptz not null default now(),
  unique (company_id, id),
  unique (company_id, warehouse_id, product_id),
  foreign key (company_id, warehouse_id) references public.warehouses(company_id, id) on delete restrict,
  foreign key (company_id, product_id) references public.products(company_id, id) on delete restrict
);

create index product_inventory_company_product_idx on public.product_inventory (company_id, product_id);
create index product_inventory_company_warehouse_idx on public.product_inventory (company_id, warehouse_id, product_id);
create index product_inventory_available_idx on public.product_inventory (company_id, warehouse_id, quantity, reserved_quantity);

insert into public.product_inventory (company_id, warehouse_id, product_id, quantity)
select p.company_id, w.id, p.id, p.stock
from public.products p
join public.warehouses w on w.company_id = p.company_id and w.is_default
on conflict (company_id, warehouse_id, product_id) do nothing;

alter table public.inventory_movements drop constraint if exists inventory_movements_movement_type_check;
alter table public.inventory_movements add constraint inventory_movements_movement_type_check
  check (movement_type in ('opening', 'sale', 'adjustment', 'purchase', 'return', 'transfer_in', 'transfer_out'));
alter table public.inventory_movements add column warehouse_id uuid;
update public.inventory_movements movement
set warehouse_id = warehouse.id
from public.warehouses warehouse
where warehouse.company_id = movement.company_id and warehouse.is_default;
alter table public.inventory_movements alter column warehouse_id set not null;
alter table public.inventory_movements add constraint inventory_movements_company_warehouse_fk
  foreign key (company_id, warehouse_id) references public.warehouses(company_id, id) on delete restrict;
create index inventory_movements_company_warehouse_cursor_idx
  on public.inventory_movements (company_id, warehouse_id, created_at desc, id desc);

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null,
  quotation_number text not null,
  issue_date date not null default current_date,
  expiry_date date not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'expired', 'rejected')),
  notes text not null default '',
  subtotal numeric(18, 2) not null default 0 check (subtotal >= 0),
  tax_rate numeric(7, 4) not null default 0 check (tax_rate between 0 and 100),
  tax_amount numeric(18, 2) not null default 0 check (tax_amount >= 0),
  total numeric(18, 2) not null default 0 check (total >= 0),
  converted_invoice_id uuid,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id),
  unique (company_id, quotation_number),
  check (expiry_date >= issue_date),
  foreign key (company_id, customer_id) references public.customers(company_id, id) on delete restrict,
  foreign key (company_id, converted_invoice_id) references public.invoices(company_id, id) on delete restrict
);

create index quotations_company_cursor_idx on public.quotations (company_id, issue_date desc, id desc);
create index quotations_company_customer_idx on public.quotations (company_id, customer_id, issue_date desc);
create index quotations_company_status_idx on public.quotations (company_id, status, expiry_date);
create index quotations_created_by_idx on public.quotations (created_by);

create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  quotation_id uuid not null,
  product_id uuid not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(18, 2) not null check (unit_price >= 0),
  unit_cost numeric(18, 2) not null default 0 check (unit_cost >= 0),
  total numeric(18, 2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now(),
  unique (company_id, id),
  unique (company_id, quotation_id, product_id),
  foreign key (company_id, quotation_id) references public.quotations(company_id, id) on delete cascade,
  foreign key (company_id, product_id) references public.products(company_id, id) on delete restrict
);

create index quotation_items_company_quotation_idx on public.quotation_items (company_id, quotation_id);
create index quotation_items_company_product_idx on public.quotation_items (company_id, product_id);

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  supplier_id uuid not null,
  purchase_number text not null,
  issue_date date not null default current_date,
  expected_date date not null,
  status text not null default 'draft' check (status in ('draft', 'ordered', 'received', 'cancelled')),
  notes text not null default '',
  subtotal numeric(18, 2) not null default 0 check (subtotal >= 0),
  tax_rate numeric(7, 4) not null default 0 check (tax_rate between 0 and 100),
  tax_amount numeric(18, 2) not null default 0 check (tax_amount >= 0),
  total numeric(18, 2) not null default 0 check (total >= 0),
  received_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id),
  unique (company_id, purchase_number),
  check (expected_date >= issue_date),
  foreign key (company_id, supplier_id) references public.suppliers(company_id, id) on delete restrict
);

create index purchase_orders_company_cursor_idx on public.purchase_orders (company_id, issue_date desc, id desc);
create index purchase_orders_company_supplier_idx on public.purchase_orders (company_id, supplier_id, issue_date desc);
create index purchase_orders_company_status_idx on public.purchase_orders (company_id, status, expected_date);
create index purchase_orders_created_by_idx on public.purchase_orders (created_by);

create table public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  purchase_order_id uuid not null,
  product_id uuid not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_cost numeric(18, 2) not null check (unit_cost >= 0),
  total numeric(18, 2) generated always as (quantity * unit_cost) stored,
  created_at timestamptz not null default now(),
  unique (company_id, id),
  unique (company_id, purchase_order_id, product_id),
  foreign key (company_id, purchase_order_id) references public.purchase_orders(company_id, id) on delete cascade,
  foreign key (company_id, product_id) references public.products(company_id, id) on delete restrict
);

create index purchase_order_items_company_order_idx on public.purchase_order_items (company_id, purchase_order_id);
create index purchase_order_items_company_product_idx on public.purchase_order_items (company_id, product_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  payment_number text not null,
  direction text not null check (direction in ('receipt', 'payment')),
  party_type text not null check (party_type in ('customer', 'supplier', 'other')),
  customer_id uuid,
  supplier_id uuid,
  party_name text not null,
  payment_date date not null default current_date,
  method text not null check (method in ('cash', 'bank', 'card', 'credit')),
  amount numeric(18, 2) not null check (amount > 0),
  reference text not null default '',
  notes text not null default '',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (company_id, id),
  unique (company_id, payment_number),
  check (
    (party_type = 'customer' and customer_id is not null and supplier_id is null and direction = 'receipt') or
    (party_type = 'supplier' and supplier_id is not null and customer_id is null and direction = 'payment') or
    (party_type = 'other' and customer_id is null and supplier_id is null)
  ),
  foreign key (company_id, customer_id) references public.customers(company_id, id) on delete restrict,
  foreign key (company_id, supplier_id) references public.suppliers(company_id, id) on delete restrict
);

create index payments_company_cursor_idx on public.payments (company_id, payment_date desc, id desc);
create index payments_company_customer_idx on public.payments (company_id, customer_id, payment_date desc) where customer_id is not null;
create index payments_company_supplier_idx on public.payments (company_id, supplier_id, payment_date desc) where supplier_id is not null;
create index payments_created_by_idx on public.payments (created_by);

create table public.sales_returns (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  return_number text not null,
  invoice_id uuid not null,
  customer_id uuid not null,
  return_date date not null default current_date,
  reason text not null check (char_length(btrim(reason)) between 1 and 1000),
  subtotal numeric(18, 2) not null default 0 check (subtotal >= 0),
  tax_amount numeric(18, 2) not null default 0 check (tax_amount >= 0),
  total numeric(18, 2) not null default 0 check (total >= 0),
  status text not null default 'completed' check (status in ('draft', 'completed', 'cancelled')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (company_id, id),
  unique (company_id, return_number),
  foreign key (company_id, invoice_id) references public.invoices(company_id, id) on delete restrict,
  foreign key (company_id, customer_id) references public.customers(company_id, id) on delete restrict
);

create index sales_returns_company_cursor_idx on public.sales_returns (company_id, return_date desc, id desc);
create index sales_returns_company_invoice_idx on public.sales_returns (company_id, invoice_id);
create index sales_returns_company_customer_idx on public.sales_returns (company_id, customer_id, return_date desc);
create index sales_returns_created_by_idx on public.sales_returns (created_by);

create table public.sales_return_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  sales_return_id uuid not null,
  invoice_item_id uuid not null,
  product_id uuid not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(18, 2) not null check (unit_price >= 0),
  unit_cost numeric(18, 2) not null check (unit_cost >= 0),
  total numeric(18, 2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now(),
  unique (company_id, id),
  unique (company_id, sales_return_id, invoice_item_id),
  foreign key (company_id, sales_return_id) references public.sales_returns(company_id, id) on delete cascade,
  foreign key (company_id, invoice_item_id) references public.invoice_items(company_id, id) on delete restrict,
  foreign key (company_id, product_id) references public.products(company_id, id) on delete restrict
);

create index sales_return_items_company_return_idx on public.sales_return_items (company_id, sales_return_id);
create index sales_return_items_company_product_idx on public.sales_return_items (company_id, product_id);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text not null check (char_length(btrim(code)) between 1 and 30),
  name text not null check (char_length(btrim(name)) between 1 and 180),
  account_type text not null check (account_type in ('asset', 'liability', 'equity', 'revenue', 'expense')),
  balance numeric(20, 4) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id),
  unique (company_id, code)
);

create index accounts_company_type_idx on public.accounts (company_id, account_type, code);
create index accounts_company_active_idx on public.accounts (company_id, is_active, code);

insert into public.accounts (company_id, code, name, account_type)
select company.id, seed.code, seed.name, seed.account_type
from public.companies company
cross join (values
  ('1101', 'الصندوق', 'asset'),
  ('1102', 'البنك', 'asset'),
  ('1201', 'العملاء', 'asset'),
  ('1301', 'المخزون', 'asset'),
  ('2101', 'الموردون', 'liability'),
  ('3101', 'رأس المال', 'equity'),
  ('4101', 'إيرادات المبيعات', 'revenue'),
  ('5101', 'تكلفة البضاعة المباعة', 'expense'),
  ('5201', 'مصروفات تشغيلية', 'expense')
) as seed(code, name, account_type)
on conflict (company_id, code) do nothing;

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  journal_number text not null,
  entry_date date not null default current_date,
  description text not null check (char_length(btrim(description)) between 1 and 1000),
  status text not null default 'posted' check (status in ('draft', 'posted', 'reversed')),
  total_debit numeric(20, 4) not null check (total_debit > 0),
  total_credit numeric(20, 4) not null check (total_credit > 0),
  reversal_of_id uuid,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  posted_at timestamptz,
  unique (company_id, id),
  unique (company_id, journal_number),
  check (total_debit = total_credit),
  foreign key (company_id, reversal_of_id) references public.journal_entries(company_id, id) on delete restrict
);

create index journal_entries_company_cursor_idx on public.journal_entries (company_id, entry_date desc, id desc);
create index journal_entries_company_status_idx on public.journal_entries (company_id, status, entry_date desc);
create index journal_entries_created_by_idx on public.journal_entries (created_by);

create table public.journal_lines (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  journal_entry_id uuid not null,
  account_id uuid not null,
  description text not null default '',
  debit numeric(20, 4) not null default 0 check (debit >= 0),
  credit numeric(20, 4) not null default 0 check (credit >= 0),
  created_at timestamptz not null default now(),
  unique (company_id, id),
  check ((debit > 0 and credit = 0) or (credit > 0 and debit = 0)),
  foreign key (company_id, journal_entry_id) references public.journal_entries(company_id, id) on delete cascade,
  foreign key (company_id, account_id) references public.accounts(company_id, id) on delete restrict
);

create index journal_lines_company_entry_idx on public.journal_lines (company_id, journal_entry_id);
create index journal_lines_company_account_idx on public.journal_lines (company_id, account_id, created_at desc);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (char_length(btrim(action)) between 1 and 180),
  entity_type text not null check (char_length(btrim(entity_type)) between 1 and 80),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_company_cursor_idx on public.audit_logs (company_id, created_at desc, id desc);
create index audit_logs_company_entity_idx on public.audit_logs (company_id, entity_type, entity_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc) where actor_id is not null;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_company_id uuid;
  invited_company_id uuid;
  company_name text;
  owner_name text;
  assigned_role text;
begin
  owner_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Owner'
  );

  invited_company_id := nullif(new.raw_app_meta_data ->> 'company_id', '')::uuid;
  assigned_role := coalesce(nullif(new.raw_app_meta_data ->> 'company_role', ''), 'employee');

  if invited_company_id is not null and exists (
    select 1 from public.companies where id = invited_company_id
  ) then
    if assigned_role not in ('admin', 'accountant', 'sales', 'inventory', 'viewer', 'employee') then
      raise exception 'Invalid invited company role';
    end if;

    insert into public.profiles (id, company_id, full_name, role)
    values (new.id, invited_company_id, owner_name, assigned_role);
    return new;
  end if;

  company_name := coalesce(nullif(btrim(new.raw_user_meta_data ->> 'company_name'), ''), 'My Company');
  insert into public.companies (name)
  values (company_name)
  returning id into assigned_company_id;

  insert into public.profiles (id, company_id, full_name, role)
  values (new.id, assigned_company_id, owner_name, 'owner');

  insert into public.categories (company_id, name, description)
  values
    (assigned_company_id, 'عام', 'التصنيف الافتراضي'),
    (assigned_company_id, 'أجهزة', 'الأجهزة والمعدات'),
    (assigned_company_id, 'إكسسوارات', 'الملحقات والإكسسوارات');

  insert into public.company_settings (company_id) values (assigned_company_id);
  insert into public.warehouses (company_id, name, is_default)
  values (assigned_company_id, 'المستودع الرئيسي', true);

  insert into public.accounts (company_id, code, name, account_type)
  values
    (assigned_company_id, '1101', 'الصندوق', 'asset'),
    (assigned_company_id, '1102', 'البنك', 'asset'),
    (assigned_company_id, '1201', 'العملاء', 'asset'),
    (assigned_company_id, '1301', 'المخزون', 'asset'),
    (assigned_company_id, '2101', 'الموردون', 'liability'),
    (assigned_company_id, '3101', 'رأس المال', 'equity'),
    (assigned_company_id, '4101', 'إيرادات المبيعات', 'revenue'),
    (assigned_company_id, '5101', 'تكلفة البضاعة المباعة', 'expense'),
    (assigned_company_id, '5201', 'مصروفات تشغيلية', 'expense');

  return new;
end;
$$;

create table private.company_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'accountant', 'sales', 'inventory', 'viewer')),
  token_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create unique index company_invitations_pending_email_idx
  on private.company_invitations (company_id, lower(email)) where status = 'pending';
create index company_invitations_expiry_idx on private.company_invitations (expires_at) where status = 'pending';

create table private.document_sequences (
  company_id uuid not null references public.companies(id) on delete cascade,
  document_type text not null check (document_type in ('invoice', 'quotation', 'purchase', 'payment', 'receipt', 'return', 'journal')),
  next_value bigint not null default 1 check (next_value > 0),
  primary key (company_id, document_type)
);

create or replace function public.next_document_number(
  p_company_id uuid,
  p_document_type text,
  p_prefix text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_value bigint;
  normalized_prefix text;
begin
  if p_document_type not in ('invoice', 'quotation', 'purchase', 'payment', 'receipt', 'return', 'journal') then
    raise exception 'Unsupported document type';
  end if;

  normalized_prefix := upper(btrim(p_prefix));
  if char_length(normalized_prefix) not between 1 and 12 then
    raise exception 'Invalid document prefix';
  end if;

  insert into private.document_sequences (company_id, document_type, next_value)
  values (p_company_id, p_document_type, 1)
  on conflict (company_id, document_type)
  do update set next_value = private.document_sequences.next_value + 1
  returning next_value into assigned_value;

  return normalized_prefix || '-' || lpad(assigned_value::text, 6, '0');
end;
$$;

revoke all on function public.next_document_number(uuid, text, text) from public, anon, authenticated;
grant execute on function public.next_document_number(uuid, text, text) to service_role;
grant usage on schema private to service_role;
grant all on private.company_invitations, private.document_sequences to service_role;

create trigger company_settings_set_updated_at before update on public.company_settings for each row execute function private.set_updated_at();
create trigger warehouses_set_updated_at before update on public.warehouses for each row execute function private.set_updated_at();
create trigger product_inventory_set_updated_at before update on public.product_inventory for each row execute function private.set_updated_at();
create trigger quotations_set_updated_at before update on public.quotations for each row execute function private.set_updated_at();
create trigger purchase_orders_set_updated_at before update on public.purchase_orders for each row execute function private.set_updated_at();
create trigger accounts_set_updated_at before update on public.accounts for each row execute function private.set_updated_at();

alter table public.company_settings enable row level security;
alter table public.warehouses enable row level security;
alter table public.product_inventory enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.payments enable row level security;
alter table public.sales_returns enable row level security;
alter table public.sales_return_items enable row level security;
alter table public.accounts enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_lines enable row level security;
alter table public.audit_logs enable row level security;

create policy company_settings_select_own on public.company_settings for select to authenticated
  using (company_id = (select private.user_company_id()));
create policy company_settings_update_owner_admin on public.company_settings for update to authenticated
  using (company_id = (select private.user_company_id()) and (select private.user_role()) in ('owner', 'admin'))
  with check (company_id = (select private.user_company_id()) and (select private.user_role()) in ('owner', 'admin'));

create policy warehouses_select_company on public.warehouses for select to authenticated
  using (company_id = (select private.user_company_id()));
create policy warehouses_insert_company on public.warehouses for insert to authenticated
  with check (company_id = (select private.user_company_id()) and (select private.user_role()) in ('owner', 'admin', 'inventory'));
create policy warehouses_update_company on public.warehouses for update to authenticated
  using (company_id = (select private.user_company_id()) and (select private.user_role()) in ('owner', 'admin', 'inventory'))
  with check (company_id = (select private.user_company_id()) and (select private.user_role()) in ('owner', 'admin', 'inventory'));

create policy product_inventory_select_company on public.product_inventory for select to authenticated
  using (company_id = (select private.user_company_id()));
create policy quotations_select_company on public.quotations for select to authenticated
  using (company_id = (select private.user_company_id()));
create policy quotation_items_select_company on public.quotation_items for select to authenticated
  using (company_id = (select private.user_company_id()));
create policy purchase_orders_select_company on public.purchase_orders for select to authenticated
  using (company_id = (select private.user_company_id()));
create policy purchase_order_items_select_company on public.purchase_order_items for select to authenticated
  using (company_id = (select private.user_company_id()));
create policy payments_select_company on public.payments for select to authenticated
  using (company_id = (select private.user_company_id()));
create policy sales_returns_select_company on public.sales_returns for select to authenticated
  using (company_id = (select private.user_company_id()));
create policy sales_return_items_select_company on public.sales_return_items for select to authenticated
  using (company_id = (select private.user_company_id()));
create policy accounts_select_company on public.accounts for select to authenticated
  using (company_id = (select private.user_company_id()));
create policy journal_entries_select_company on public.journal_entries for select to authenticated
  using (company_id = (select private.user_company_id()));
create policy journal_lines_select_company on public.journal_lines for select to authenticated
  using (company_id = (select private.user_company_id()));
create policy audit_logs_select_owner_admin on public.audit_logs for select to authenticated
  using (company_id = (select private.user_company_id()) and (select private.user_role()) in ('owner', 'admin'));

revoke all on public.company_settings, public.warehouses, public.product_inventory,
  public.quotations, public.quotation_items, public.purchase_orders, public.purchase_order_items,
  public.payments, public.sales_returns, public.sales_return_items, public.accounts,
  public.journal_entries, public.journal_lines, public.audit_logs from anon, authenticated;

grant select on public.company_settings, public.warehouses, public.product_inventory,
  public.quotations, public.quotation_items, public.purchase_orders, public.purchase_order_items,
  public.payments, public.sales_returns, public.sales_return_items, public.accounts,
  public.journal_entries, public.journal_lines, public.audit_logs to authenticated;
grant update (currency, tax_rate, invoice_prefix, quotation_prefix, purchase_prefix, fiscal_year_start)
  on public.company_settings to authenticated;
grant insert (company_id, name, location, is_default, is_active), update (name, location, is_default, is_active)
  on public.warehouses to authenticated;

grant all on public.company_settings, public.warehouses, public.product_inventory,
  public.quotations, public.quotation_items, public.purchase_orders, public.purchase_order_items,
  public.payments, public.sales_returns, public.sales_return_items, public.accounts,
  public.journal_entries, public.journal_lines, public.audit_logs to service_role;

-- Existing financial tables were initially writable from the browser. Keep reads
-- available, but require the NestJS transaction layer for mutations at launch.
revoke insert, update, delete on public.invoices, public.invoice_items,
  public.inventory_movements, public.expenses from authenticated;
grant select on public.invoices, public.invoice_items, public.inventory_movements, public.expenses to authenticated;

commit;
