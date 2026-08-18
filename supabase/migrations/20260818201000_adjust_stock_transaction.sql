begin;

create or replace function public.adjust_stock(
  p_actor_id uuid,
  p_product_id uuid,
  p_quantity_delta integer,
  p_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_role text;
  v_product_name text;
  v_unit_cost numeric(18,2);
  v_product_stock integer;
  v_warehouse_id uuid;
  v_warehouse_stock integer;
  v_new_stock integer;
  v_value numeric(20,4);
  v_inventory_account_id uuid;
  v_gain_account_id uuid;
  v_loss_account_id uuid;
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
    raise exception 'Actor is not allowed to adjust stock';
  end if;

  if p_quantity_delta is null or p_quantity_delta = 0 then
    raise exception 'Quantity delta must not be zero';
  end if;

  select product.name, product.cost, product.stock
    into v_product_name, v_unit_cost, v_product_stock
  from public.products product
  where product.company_id = v_company_id
    and product.id = p_product_id
    and product.is_active
  for update;

  if v_product_name is null then
    raise exception 'Product not found or inactive';
  end if;

  select warehouse.id
    into v_warehouse_id
  from public.warehouses warehouse
  where warehouse.company_id = v_company_id
    and warehouse.is_default
    and warehouse.is_active
  limit 1;

  if v_warehouse_id is null then
    raise exception 'Default warehouse is not configured';
  end if;

  select inventory.quantity
    into v_warehouse_stock
  from public.product_inventory inventory
  where inventory.company_id = v_company_id
    and inventory.warehouse_id = v_warehouse_id
    and inventory.product_id = p_product_id
  for update;

  if v_warehouse_stock is null then
    raise exception 'Product inventory row is missing';
  end if;

  v_new_stock := v_warehouse_stock + p_quantity_delta;
  if v_new_stock < 0 or v_product_stock + p_quantity_delta < 0 then
    raise exception 'Stock adjustment would make inventory negative';
  end if;

  update public.product_inventory
    set quantity = v_new_stock
  where company_id = v_company_id
    and warehouse_id = v_warehouse_id
    and product_id = p_product_id;

  update public.products
    set stock = stock + p_quantity_delta
  where company_id = v_company_id and id = p_product_id;

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
    p_product_id,
    v_warehouse_id,
    'adjustment',
    p_quantity_delta,
    v_new_stock,
    left(coalesce(nullif(btrim(p_reference), ''), 'Stock adjustment'), 180),
    p_actor_id
  );

  v_value := round(abs(p_quantity_delta) * v_unit_cost, 4);

  if v_value > 0 then
    select id into v_inventory_account_id
    from public.accounts
    where company_id = v_company_id and code = '1301' and is_active
    limit 1;

    select id into v_gain_account_id
    from public.accounts
    where company_id = v_company_id and code = '4201' and is_active
    limit 1;

    select id into v_loss_account_id
    from public.accounts
    where company_id = v_company_id and code = '5301' and is_active
    limit 1;

    if v_inventory_account_id is null or v_gain_account_id is null or v_loss_account_id is null then
      raise exception 'Inventory adjustment accounts are not configured';
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
      'تسوية مخزون - ' || v_product_name,
      'posted',
      v_value,
      v_value,
      p_actor_id,
      now()
    ) returning id into v_journal_id;

    if p_quantity_delta > 0 then
      insert into public.journal_lines (company_id, journal_entry_id, account_id, description, debit, credit)
      values
        (v_company_id, v_journal_id, v_inventory_account_id, 'زيادة مخزون', v_value, 0),
        (v_company_id, v_journal_id, v_gain_account_id, 'مكسب تسوية مخزون', 0, v_value);

      update public.accounts set balance = balance + v_value
      where company_id = v_company_id and id = v_inventory_account_id;
      update public.accounts set balance = balance + v_value
      where company_id = v_company_id and id = v_gain_account_id;
    else
      insert into public.journal_lines (company_id, journal_entry_id, account_id, description, debit, credit)
      values
        (v_company_id, v_journal_id, v_loss_account_id, 'خسارة تسوية مخزون', v_value, 0),
        (v_company_id, v_journal_id, v_inventory_account_id, 'نقص مخزون', 0, v_value);

      update public.accounts set balance = balance + v_value
      where company_id = v_company_id and id = v_loss_account_id;
      update public.accounts set balance = balance - v_value
      where company_id = v_company_id and id = v_inventory_account_id;
    end if;
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
    'adjusted_stock',
    'product',
    p_product_id,
    jsonb_build_object(
      'quantity_delta', p_quantity_delta,
      'balance_after', v_new_stock,
      'reference', coalesce(p_reference, ''),
      'value', v_value
    )
  );

  return jsonb_build_object(
    'product_id', p_product_id,
    'stock', v_new_stock,
    'value', v_value
  );
end;
$$;

revoke all on function public.adjust_stock(uuid, uuid, integer, text)
  from public, anon, authenticated;
grant execute on function public.adjust_stock(uuid, uuid, integer, text)
  to service_role;

commit;
