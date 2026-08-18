begin;

create or replace function public.create_product(
  p_actor_id uuid,
  p_name text,
  p_sku text,
  p_category_id uuid,
  p_cost numeric,
  p_price numeric,
  p_initial_stock integer,
  p_low_stock_threshold integer,
  p_description text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_role text;
  v_product_id uuid;
  v_default_warehouse_id uuid;
  v_inventory_value numeric(20,4);
  v_inventory_account_id uuid;
  v_capital_account_id uuid;
  v_journal_id uuid;
  v_journal_number text;
begin
  select profile.company_id, profile.role
    into v_company_id, v_role
  from public.profiles profile
  where profile.id = p_actor_id;

  if v_company_id is null then
    raise exception 'Authenticated actor is not linked to a company';
  end if;

  if v_role not in ('owner', 'admin', 'inventory') then
    raise exception 'Actor is not allowed to create products';
  end if;

  if char_length(btrim(coalesce(p_name, ''))) < 1 or char_length(btrim(p_name)) > 180 then
    raise exception 'Invalid product name';
  end if;

  if char_length(btrim(coalesce(p_sku, ''))) < 1 or char_length(btrim(p_sku)) > 80 then
    raise exception 'Invalid SKU';
  end if;

  if p_cost is null or p_cost < 0 or p_price is null or p_price < 0 then
    raise exception 'Cost and price must be zero or greater';
  end if;

  if p_initial_stock is null or p_initial_stock < 0 then
    raise exception 'Initial stock must be zero or greater';
  end if;

  if p_low_stock_threshold is null or p_low_stock_threshold < 0 then
    raise exception 'Low stock threshold must be zero or greater';
  end if;

  if not exists (
    select 1
    from public.categories category
    where category.company_id = v_company_id
      and category.id = p_category_id
      and category.is_active
  ) then
    raise exception 'Category not found or inactive';
  end if;

  select warehouse.id
    into v_default_warehouse_id
  from public.warehouses warehouse
  where warehouse.company_id = v_company_id
    and warehouse.is_default
    and warehouse.is_active
  limit 1;

  if v_default_warehouse_id is null then
    raise exception 'Default warehouse is not configured';
  end if;

  insert into public.products (
    company_id,
    category_id,
    name,
    sku,
    description,
    cost,
    price,
    stock,
    low_stock_threshold,
    is_active
  ) values (
    v_company_id,
    p_category_id,
    btrim(p_name),
    btrim(p_sku),
    btrim(coalesce(p_description, '')),
    p_cost,
    p_price,
    p_initial_stock,
    p_low_stock_threshold,
    true
  )
  returning id into v_product_id;

  insert into public.product_inventory (
    company_id,
    warehouse_id,
    product_id,
    quantity,
    reserved_quantity
  ) values (
    v_company_id,
    v_default_warehouse_id,
    v_product_id,
    p_initial_stock,
    0
  );

  if p_initial_stock > 0 then
    insert into public.inventory_movements (
      company_id,
      product_id,
      warehouse_id,
      movement_type,
      quantity_delta,
      balance_after,
      reference,
      created_by
    ) values (
      v_company_id,
      v_product_id,
      v_default_warehouse_id,
      'opening',
      p_initial_stock,
      p_initial_stock,
      'Opening stock',
      p_actor_id
    );
  end if;

  v_inventory_value := round(p_initial_stock * p_cost, 4);

  if v_inventory_value > 0 then
    select id into v_inventory_account_id
    from public.accounts
    where company_id = v_company_id and code = '1301' and is_active
    limit 1;

    select id into v_capital_account_id
    from public.accounts
    where company_id = v_company_id and code = '3101' and is_active
    limit 1;

    if v_inventory_account_id is null or v_capital_account_id is null then
      raise exception 'Required opening inventory accounts are not configured';
    end if;

    v_journal_number := public.next_document_number(v_company_id, 'journal', 'JE');

    insert into public.journal_entries (
      company_id,
      journal_number,
      entry_date,
      description,
      status,
      total_debit,
      total_credit,
      created_by,
      posted_at
    ) values (
      v_company_id,
      v_journal_number,
      current_date,
      'Opening inventory for ' || btrim(p_name),
      'posted',
      v_inventory_value,
      v_inventory_value,
      p_actor_id,
      now()
    ) returning id into v_journal_id;

    insert into public.journal_lines (
      company_id,
      journal_entry_id,
      account_id,
      description,
      debit,
      credit
    ) values
      (v_company_id, v_journal_id, v_inventory_account_id, 'Opening inventory', v_inventory_value, 0),
      (v_company_id, v_journal_id, v_capital_account_id, 'Opening inventory equity', 0, v_inventory_value);

    update public.accounts
      set balance = balance + v_inventory_value
    where company_id = v_company_id and id = v_inventory_account_id;

    update public.accounts
      set balance = balance + v_inventory_value
    where company_id = v_company_id and id = v_capital_account_id;
  end if;

  insert into public.audit_logs (
    company_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    v_company_id,
    p_actor_id,
    'created_product',
    'product',
    v_product_id,
    jsonb_build_object(
      'sku', btrim(p_sku),
      'initial_stock', p_initial_stock,
      'initial_inventory_value', v_inventory_value,
      'warehouse_id', v_default_warehouse_id
    )
  );

  return jsonb_build_object('product_id', v_product_id);
end;
$$;

revoke all on function public.create_product(uuid, text, text, uuid, numeric, numeric, integer, integer, text)
  from public, anon, authenticated;
grant execute on function public.create_product(uuid, text, text, uuid, numeric, numeric, integer, integer, text)
  to service_role;

commit;
