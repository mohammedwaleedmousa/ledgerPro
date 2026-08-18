begin;

create unique index if not exists quotation_items_one_product_per_quote_idx
  on public.quotation_items (company_id, quotation_id, product_id);

create or replace function private.enforce_quotation_item_catalog_price()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_price numeric(18,2);
begin
  select price into v_price from public.products where company_id=new.company_id and id=new.product_id and is_active;
  if v_price is null then raise exception 'Product is missing or inactive'; end if;
  if round(new.unit_price,2) <> round(v_price,2) then raise exception 'Quotation unit price must match the current catalog price'; end if;
  return new;
end; $$;
revoke all on function private.enforce_quotation_item_catalog_price() from public,anon,authenticated;
drop trigger if exists quotation_items_enforce_catalog_price on public.quotation_items;
create trigger quotation_items_enforce_catalog_price before insert on public.quotation_items for each row execute function private.enforce_quotation_item_catalog_price();

create or replace function public.create_quotation(
  p_actor_id uuid,p_customer_id uuid,p_issue_date date,p_expiry_date date,p_status text,p_tax_rate numeric,p_notes text,p_items jsonb
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare
  c uuid; r text; qid uuid; qnum text; prefix text; subtotal numeric(18,2):=0; tax numeric(18,2); total numeric(18,2);
  item jsonb; pid uuid; qty integer; price numeric(18,2); pname text; pcost numeric(18,2);
begin
  select company_id,role into c,r from public.profiles where id=p_actor_id;
  if c is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if r not in ('owner','admin','accountant','sales') then raise exception 'Actor is not allowed to create quotations'; end if;
  if p_status not in ('draft','sent') then raise exception 'Invalid initial quotation status'; end if;
  if p_expiry_date < p_issue_date then raise exception 'Expiry date cannot precede issue date'; end if;
  if p_tax_rate < 0 or p_tax_rate > 100 then raise exception 'Invalid tax rate'; end if;
  if not exists(select 1 from public.customers where company_id=c and id=p_customer_id and status='active') then raise exception 'Customer not found or inactive'; end if;
  if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'Quotation requires items'; end if;

  for item in select value from jsonb_array_elements(p_items) loop
    pid:=(item->>'product_id')::uuid; qty:=(item->>'quantity')::integer; price:=(item->>'unit_price')::numeric;
    if qty<=0 or price<0 then raise exception 'Invalid quotation item'; end if;
    select name,cost into pname,pcost from public.products where company_id=c and id=pid and is_active;
    if pname is null then raise exception 'Product not found or inactive'; end if;
    subtotal:=subtotal+round(qty*price,2);
  end loop;
  tax:=round(subtotal*(p_tax_rate/100),2); total:=subtotal+tax;
  select quotation_prefix into prefix from public.company_settings where company_id=c;
  qnum:=public.next_document_number(c,'quotation',prefix);
  insert into public.quotations(company_id,customer_id,quotation_number,issue_date,expiry_date,status,notes,subtotal,tax_rate,tax_amount,total,created_by)
  values(c,p_customer_id,qnum,p_issue_date,p_expiry_date,p_status,coalesce(p_notes,''),subtotal,p_tax_rate,tax,total,p_actor_id) returning id into qid;
  for item in select value from jsonb_array_elements(p_items) loop
    pid:=(item->>'product_id')::uuid; qty:=(item->>'quantity')::integer; price:=(item->>'unit_price')::numeric;
    select name,cost into pname,pcost from public.products where company_id=c and id=pid;
    insert into public.quotation_items(company_id,quotation_id,product_id,product_name,quantity,unit_price,unit_cost)
    values(c,qid,pid,pname,qty,price,pcost);
  end loop;
  insert into public.audit_logs(company_id,actor_id,action,entity_type,entity_id,metadata)
  values(c,p_actor_id,'created_quotation','quotation',qid,jsonb_build_object('quotation_number',qnum,'total',total));
  return jsonb_build_object('quotation_id',qid,'quotation_number',qnum,'total',total);
end; $$;

create or replace function public.convert_quotation_to_invoice(
  p_actor_id uuid,p_quotation_id uuid,p_payment_method text
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare
  c uuid; r text; q record; items jsonb; inv jsonb;
begin
  select company_id,role into c,r from public.profiles where id=p_actor_id;
  if c is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if r not in ('owner','admin','accountant','sales') then raise exception 'Actor is not allowed to convert quotations'; end if;
  select * into q from public.quotations where company_id=c and id=p_quotation_id for update;
  if q.id is null then raise exception 'Quotation not found'; end if;
  if q.status<>'accepted' then raise exception 'Only accepted quotations can be converted'; end if;
  if q.converted_invoice_id is not null then
    return jsonb_build_object('invoice_id',q.converted_invoice_id,'quotation_id',q.id,'already_converted',true);
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('product_id',product_id,'quantity',quantity,'unit_price',unit_price) order by created_at),'[]'::jsonb)
    into items from public.quotation_items where company_id=c and quotation_id=q.id;
  inv:=public.post_invoice(p_actor_id,q.customer_id,current_date,p_payment_method,q.tax_rate,'Converted from quotation '||q.quotation_number,items);
  update public.quotations set converted_invoice_id=(inv->>'invoice_id')::uuid where company_id=c and id=q.id;
  insert into public.audit_logs(company_id,actor_id,action,entity_type,entity_id,metadata)
  values(c,p_actor_id,'converted_quotation','quotation',q.id,jsonb_build_object('invoice_id',inv->>'invoice_id','quotation_number',q.quotation_number));
  return inv || jsonb_build_object('quotation_id',q.id);
end; $$;

revoke all on function public.create_quotation(uuid,uuid,date,date,text,numeric,text,jsonb) from public,anon,authenticated;
revoke all on function public.convert_quotation_to_invoice(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.create_quotation(uuid,uuid,date,date,text,numeric,text,jsonb) to service_role;
grant execute on function public.convert_quotation_to_invoice(uuid,uuid,text) to service_role;

create or replace function public.create_quotation_idempotent(p_actor_id uuid,p_customer_id uuid,p_issue_date date,p_expiry_date date,p_status text,p_tax_rate numeric,p_notes text,p_items jsonb,p_request_key text)
returns jsonb language plpgsql security invoker set search_path='' as $$ declare x jsonb; begin x:=private.claim_mutation(p_actor_id,'quotation_create',p_request_key); if x is not null then return x; end if; x:=public.create_quotation(p_actor_id,p_customer_id,p_issue_date,p_expiry_date,p_status,p_tax_rate,p_notes,p_items); perform private.complete_mutation(p_actor_id,'quotation_create',p_request_key,x); return x; end; $$;
create or replace function public.convert_quotation_to_invoice_idempotent(p_actor_id uuid,p_quotation_id uuid,p_payment_method text,p_request_key text)
returns jsonb language plpgsql security invoker set search_path='' as $$ declare x jsonb; begin x:=private.claim_mutation(p_actor_id,'quotation_convert',p_request_key); if x is not null then return x; end if; x:=public.convert_quotation_to_invoice(p_actor_id,p_quotation_id,p_payment_method); perform private.complete_mutation(p_actor_id,'quotation_convert',p_request_key,x); return x; end; $$;
revoke all on function public.create_quotation_idempotent(uuid,uuid,date,date,text,numeric,text,jsonb,text) from public,anon,authenticated;
revoke all on function public.convert_quotation_to_invoice_idempotent(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.create_quotation_idempotent(uuid,uuid,date,date,text,numeric,text,jsonb,text) to service_role;
grant execute on function public.convert_quotation_to_invoice_idempotent(uuid,uuid,text,text) to service_role;

commit;
