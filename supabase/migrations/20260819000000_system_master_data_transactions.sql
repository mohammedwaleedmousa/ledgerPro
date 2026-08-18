begin;

create or replace function public.create_category(
  p_actor_id uuid,
  p_name text,
  p_description text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_role text;
  v_category_id uuid;
begin
  select company_id, role into v_company_id, v_role from public.profiles where id = p_actor_id;
  if v_company_id is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if v_role not in ('owner','admin','inventory') then raise exception 'Actor is not allowed to create categories'; end if;
  if char_length(btrim(coalesce(p_name,''))) < 1 or char_length(btrim(p_name)) > 120 then raise exception 'Invalid category name'; end if;

  insert into public.categories (company_id,name,description,is_active)
  values (v_company_id,btrim(p_name),btrim(coalesce(p_description,'')),true)
  returning id into v_category_id;

  insert into public.audit_logs(company_id,actor_id,action,entity_type,entity_id,metadata)
  values(v_company_id,p_actor_id,'created_category','category',v_category_id,jsonb_build_object('name',btrim(p_name)));

  return jsonb_build_object('category_id',v_category_id);
end;
$$;

create or replace function public.deactivate_category(
  p_actor_id uuid,
  p_category_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_role text;
begin
  select company_id, role into v_company_id, v_role from public.profiles where id = p_actor_id;
  if v_company_id is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if v_role not in ('owner','admin','inventory') then raise exception 'Actor is not allowed to deactivate categories'; end if;

  update public.categories set is_active=false
  where company_id=v_company_id and id=p_category_id and is_active;
  if not found then raise exception 'Category not found or already inactive'; end if;

  insert into public.audit_logs(company_id,actor_id,action,entity_type,entity_id,metadata)
  values(v_company_id,p_actor_id,'deactivated_category','category',p_category_id,'{}'::jsonb);

  return jsonb_build_object('category_id',p_category_id);
end;
$$;

create or replace function public.create_warehouse(
  p_actor_id uuid,
  p_name text,
  p_location text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_role text;
  v_warehouse_id uuid;
begin
  select company_id, role into v_company_id, v_role from public.profiles where id = p_actor_id;
  if v_company_id is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if v_role not in ('owner','admin','inventory') then raise exception 'Actor is not allowed to create warehouses'; end if;
  if char_length(btrim(coalesce(p_name,''))) < 1 or char_length(btrim(p_name)) > 120 then raise exception 'Invalid warehouse name'; end if;

  insert into public.warehouses(company_id,name,location,is_default,is_active)
  values(v_company_id,btrim(p_name),btrim(coalesce(p_location,'')),false,true)
  returning id into v_warehouse_id;

  insert into public.audit_logs(company_id,actor_id,action,entity_type,entity_id,metadata)
  values(v_company_id,p_actor_id,'created_warehouse','warehouse',v_warehouse_id,jsonb_build_object('name',btrim(p_name)));

  return jsonb_build_object('warehouse_id',v_warehouse_id);
end;
$$;

create or replace function public.transfer_stock(
  p_actor_id uuid,
  p_product_id uuid,
  p_from_warehouse_id uuid,
  p_to_warehouse_id uuid,
  p_quantity integer,
  p_reference text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_role text;
  v_from_quantity integer;
  v_to_quantity integer;
begin
  select company_id, role into v_company_id, v_role from public.profiles where id = p_actor_id;
  if v_company_id is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if v_role not in ('owner','admin','inventory') then raise exception 'Actor is not allowed to transfer stock'; end if;
  if p_quantity is null or p_quantity <= 0 then raise exception 'Transfer quantity must be positive'; end if;
  if p_from_warehouse_id = p_to_warehouse_id then raise exception 'Source and destination warehouses must differ'; end if;
  if not exists(select 1 from public.products where company_id=v_company_id and id=p_product_id and is_active) then raise exception 'Product not found or inactive'; end if;
  if not exists(select 1 from public.warehouses where company_id=v_company_id and id=p_from_warehouse_id and is_active) then raise exception 'Source warehouse not found or inactive'; end if;
  if not exists(select 1 from public.warehouses where company_id=v_company_id and id=p_to_warehouse_id and is_active) then raise exception 'Destination warehouse not found or inactive'; end if;

  select quantity into v_from_quantity
  from public.product_inventory
  where company_id=v_company_id and warehouse_id=p_from_warehouse_id and product_id=p_product_id
  for update;
  if v_from_quantity is null or v_from_quantity < p_quantity then raise exception 'Insufficient stock in source warehouse'; end if;

  update public.product_inventory
  set quantity=quantity-p_quantity
  where company_id=v_company_id and warehouse_id=p_from_warehouse_id and product_id=p_product_id
  returning quantity into v_from_quantity;

  insert into public.product_inventory(company_id,warehouse_id,product_id,quantity,reserved_quantity)
  values(v_company_id,p_to_warehouse_id,p_product_id,p_quantity,0)
  on conflict(company_id,warehouse_id,product_id)
  do update set quantity=public.product_inventory.quantity+excluded.quantity
  returning quantity into v_to_quantity;

  insert into public.inventory_movements(company_id,product_id,warehouse_id,movement_type,quantity_delta,balance_after,reference,created_by)
  values
    (v_company_id,p_product_id,p_from_warehouse_id,'transfer_out',-p_quantity,v_from_quantity,btrim(coalesce(p_reference,'')),p_actor_id),
    (v_company_id,p_product_id,p_to_warehouse_id,'transfer_in',p_quantity,v_to_quantity,btrim(coalesce(p_reference,'')),p_actor_id);

  insert into public.audit_logs(company_id,actor_id,action,entity_type,entity_id,metadata)
  values(v_company_id,p_actor_id,'transferred_stock','product',p_product_id,jsonb_build_object('from_warehouse_id',p_from_warehouse_id,'to_warehouse_id',p_to_warehouse_id,'quantity',p_quantity,'reference',btrim(coalesce(p_reference,''))));

  return jsonb_build_object('product_id',p_product_id,'from_stock',v_from_quantity,'to_stock',v_to_quantity);
end;
$$;

create or replace function public.create_account(
  p_actor_id uuid,
  p_code text,
  p_name text,
  p_account_type text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_role text;
  v_account_id uuid;
begin
  select company_id, role into v_company_id, v_role from public.profiles where id = p_actor_id;
  if v_company_id is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if v_role not in ('owner','admin','accountant') then raise exception 'Actor is not allowed to create accounts'; end if;
  if char_length(btrim(coalesce(p_code,''))) < 1 or char_length(btrim(p_code)) > 30 then raise exception 'Invalid account code'; end if;
  if char_length(btrim(coalesce(p_name,''))) < 1 or char_length(btrim(p_name)) > 180 then raise exception 'Invalid account name'; end if;
  if p_account_type not in ('asset','liability','equity','revenue','expense') then raise exception 'Invalid account type'; end if;

  insert into public.accounts(company_id,code,name,account_type,balance,is_active)
  values(v_company_id,btrim(p_code),btrim(p_name),p_account_type,0,true)
  returning id into v_account_id;

  insert into public.audit_logs(company_id,actor_id,action,entity_type,entity_id,metadata)
  values(v_company_id,p_actor_id,'created_account','account',v_account_id,jsonb_build_object('code',btrim(p_code),'type',p_account_type));

  return jsonb_build_object('account_id',v_account_id);
end;
$$;

create or replace function public.update_company_settings(
  p_actor_id uuid,
  p_currency text,
  p_tax_rate numeric,
  p_invoice_prefix text,
  p_quotation_prefix text,
  p_purchase_prefix text,
  p_fiscal_year_start text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_role text;
begin
  select company_id, role into v_company_id, v_role from public.profiles where id = p_actor_id;
  if v_company_id is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if v_role not in ('owner','admin') then raise exception 'Actor is not allowed to update company settings'; end if;
  if p_currency not in ('USD','YER','SAR') then raise exception 'Invalid currency'; end if;
  if p_tax_rate < 0 or p_tax_rate > 100 then raise exception 'Invalid tax rate'; end if;
  if char_length(btrim(p_invoice_prefix)) not between 1 and 12 or char_length(btrim(p_quotation_prefix)) not between 1 and 12 or char_length(btrim(p_purchase_prefix)) not between 1 and 12 then raise exception 'Invalid document prefix'; end if;
  if p_fiscal_year_start !~ '^[0-9]{2}-[0-9]{2}$' then raise exception 'Invalid fiscal year start'; end if;

  update public.company_settings
  set currency=p_currency,tax_rate=p_tax_rate,invoice_prefix=upper(btrim(p_invoice_prefix)),quotation_prefix=upper(btrim(p_quotation_prefix)),purchase_prefix=upper(btrim(p_purchase_prefix)),fiscal_year_start=p_fiscal_year_start
  where company_id=v_company_id;
  if not found then raise exception 'Company settings not found'; end if;

  insert into public.audit_logs(company_id,actor_id,action,entity_type,entity_id,metadata)
  values(v_company_id,p_actor_id,'updated_settings','settings',null,jsonb_build_object('currency',p_currency,'tax_rate',p_tax_rate));

  return jsonb_build_object('company_id',v_company_id);
end;
$$;

revoke all on function public.create_category(uuid,text,text) from public,anon,authenticated;
revoke all on function public.deactivate_category(uuid,uuid) from public,anon,authenticated;
revoke all on function public.create_warehouse(uuid,text,text) from public,anon,authenticated;
revoke all on function public.transfer_stock(uuid,uuid,uuid,uuid,integer,text) from public,anon,authenticated;
revoke all on function public.create_account(uuid,text,text,text) from public,anon,authenticated;
revoke all on function public.update_company_settings(uuid,text,numeric,text,text,text,text) from public,anon,authenticated;
grant execute on function public.create_category(uuid,text,text) to service_role;
grant execute on function public.deactivate_category(uuid,uuid) to service_role;
grant execute on function public.create_warehouse(uuid,text,text) to service_role;
grant execute on function public.transfer_stock(uuid,uuid,uuid,uuid,integer,text) to service_role;
grant execute on function public.create_account(uuid,text,text,text) to service_role;
grant execute on function public.update_company_settings(uuid,text,numeric,text,text,text,text) to service_role;

commit;
