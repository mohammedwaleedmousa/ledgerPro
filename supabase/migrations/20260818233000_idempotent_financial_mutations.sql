begin;

create table if not exists private.mutation_requests (
  company_id uuid not null references public.companies(id) on delete cascade,
  mutation_type text not null,
  request_key text not null,
  response jsonb,
  created_at timestamptz not null default now(),
  primary key (company_id, mutation_type, request_key),
  check (char_length(request_key) between 8 and 200)
);
create index if not exists mutation_requests_created_at_idx on private.mutation_requests (created_at);
revoke all on private.mutation_requests from public, anon, authenticated;
grant all on private.mutation_requests to service_role;

create or replace function private.claim_mutation(
  p_actor_id uuid,
  p_mutation_type text,
  p_request_key text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_inserted integer;
  v_response jsonb;
begin
  select company_id into v_company_id from public.profiles where id = p_actor_id;
  if v_company_id is null then raise exception 'Authenticated actor is not linked to a company'; end if;
  if char_length(btrim(coalesce(p_request_key, ''))) < 8 or char_length(btrim(p_request_key)) > 200 then
    raise exception 'Invalid idempotency key';
  end if;

  insert into private.mutation_requests (company_id, mutation_type, request_key)
  values (v_company_id, p_mutation_type, btrim(p_request_key))
  on conflict do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted = 1 then return null; end if;

  select response into v_response
  from private.mutation_requests
  where company_id = v_company_id and mutation_type = p_mutation_type and request_key = btrim(p_request_key);

  if v_response is null then raise exception 'Mutation request is already in progress'; end if;
  return v_response;
end;
$$;

create or replace function private.complete_mutation(
  p_actor_id uuid,
  p_mutation_type text,
  p_request_key text,
  p_response jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_company_id uuid;
begin
  select company_id into v_company_id from public.profiles where id = p_actor_id;
  update private.mutation_requests
  set response = p_response
  where company_id = v_company_id and mutation_type = p_mutation_type and request_key = btrim(p_request_key);
end;
$$;

revoke all on function private.claim_mutation(uuid,text,text) from public, anon, authenticated;
revoke all on function private.complete_mutation(uuid,text,text,jsonb) from public, anon, authenticated;
grant execute on function private.claim_mutation(uuid,text,text) to service_role;
grant execute on function private.complete_mutation(uuid,text,text,jsonb) to service_role;

create or replace function public.post_invoice_idempotent(p_actor_id uuid,p_customer_id uuid,p_issue_date date,p_payment_method text,p_tax_rate numeric,p_notes text,p_items jsonb,p_request_key text)
returns jsonb language plpgsql security invoker set search_path='' as $$ declare r jsonb; begin r:=private.claim_mutation(p_actor_id,'invoice',p_request_key); if r is not null then return r; end if; r:=public.post_invoice(p_actor_id,p_customer_id,p_issue_date,p_payment_method,p_tax_rate,p_notes,p_items); perform private.complete_mutation(p_actor_id,'invoice',p_request_key,r); return r; end; $$;

create or replace function public.adjust_stock_idempotent(p_actor_id uuid,p_product_id uuid,p_quantity_delta integer,p_reference text,p_request_key text)
returns jsonb language plpgsql security invoker set search_path='' as $$ declare r jsonb; begin r:=private.claim_mutation(p_actor_id,'stock_adjustment',p_request_key); if r is not null then return r; end if; r:=public.adjust_stock(p_actor_id,p_product_id,p_quantity_delta,p_reference); perform private.complete_mutation(p_actor_id,'stock_adjustment',p_request_key,r); return r; end; $$;

create or replace function public.post_payment_idempotent(p_actor_id uuid,p_direction text,p_party_id uuid,p_payment_date date,p_method text,p_amount numeric,p_reference text,p_notes text,p_request_key text)
returns jsonb language plpgsql security invoker set search_path='' as $$ declare r jsonb; begin r:=private.claim_mutation(p_actor_id,'payment',p_request_key); if r is not null then return r; end if; r:=public.post_payment(p_actor_id,p_direction,p_party_id,p_payment_date,p_method,p_amount,p_reference,p_notes); perform private.complete_mutation(p_actor_id,'payment',p_request_key,r); return r; end; $$;

create or replace function public.create_purchase_order_idempotent(p_actor_id uuid,p_supplier_id uuid,p_issue_date date,p_expected_date date,p_status text,p_tax_rate numeric,p_notes text,p_items jsonb,p_request_key text)
returns jsonb language plpgsql security invoker set search_path='' as $$ declare r jsonb; begin r:=private.claim_mutation(p_actor_id,'purchase_create',p_request_key); if r is not null then return r; end if; r:=public.create_purchase_order(p_actor_id,p_supplier_id,p_issue_date,p_expected_date,p_status,p_tax_rate,p_notes,p_items); perform private.complete_mutation(p_actor_id,'purchase_create',p_request_key,r); return r; end; $$;

create or replace function public.receive_purchase_order_idempotent(p_actor_id uuid,p_purchase_order_id uuid,p_request_key text)
returns jsonb language plpgsql security invoker set search_path='' as $$ declare r jsonb; begin r:=private.claim_mutation(p_actor_id,'purchase_receive',p_request_key); if r is not null then return r; end if; r:=public.receive_purchase_order(p_actor_id,p_purchase_order_id); perform private.complete_mutation(p_actor_id,'purchase_receive',p_request_key,r); return r; end; $$;

create or replace function public.post_sales_return_idempotent(p_actor_id uuid,p_invoice_id uuid,p_reason text,p_request_key text)
returns jsonb language plpgsql security invoker set search_path='' as $$ declare r jsonb; begin r:=private.claim_mutation(p_actor_id,'sales_return',p_request_key); if r is not null then return r; end if; r:=public.post_sales_return(p_actor_id,p_invoice_id,p_reason); perform private.complete_mutation(p_actor_id,'sales_return',p_request_key,r); return r; end; $$;

create or replace function public.post_expense_idempotent(p_actor_id uuid,p_category text,p_description text,p_amount numeric,p_expense_date date,p_status text,p_supplier_id uuid,p_payment_method text,p_request_key text)
returns jsonb language plpgsql security invoker set search_path='' as $$ declare r jsonb; begin r:=private.claim_mutation(p_actor_id,'expense',p_request_key); if r is not null then return r; end if; r:=public.post_expense(p_actor_id,p_category,p_description,p_amount,p_expense_date,p_status,p_supplier_id,p_payment_method); perform private.complete_mutation(p_actor_id,'expense',p_request_key,r); return r; end; $$;

create or replace function public.post_manual_journal_idempotent(p_actor_id uuid,p_entry_date date,p_description text,p_lines jsonb,p_request_key text)
returns jsonb language plpgsql security invoker set search_path='' as $$ declare r jsonb; begin r:=private.claim_mutation(p_actor_id,'manual_journal',p_request_key); if r is not null then return r; end if; r:=public.post_manual_journal(p_actor_id,p_entry_date,p_description,p_lines); perform private.complete_mutation(p_actor_id,'manual_journal',p_request_key,r); return r; end; $$;

create or replace function public.reverse_manual_journal_idempotent(p_actor_id uuid,p_journal_entry_id uuid,p_reason text,p_request_key text)
returns jsonb language plpgsql security invoker set search_path='' as $$ declare r jsonb; begin r:=private.claim_mutation(p_actor_id,'journal_reversal',p_request_key); if r is not null then return r; end if; r:=public.reverse_manual_journal(p_actor_id,p_journal_entry_id,p_reason); perform private.complete_mutation(p_actor_id,'journal_reversal',p_request_key,r); return r; end; $$;

revoke all on function public.post_invoice_idempotent(uuid,uuid,date,text,numeric,text,jsonb,text) from public,anon,authenticated;
revoke all on function public.adjust_stock_idempotent(uuid,uuid,integer,text,text) from public,anon,authenticated;
revoke all on function public.post_payment_idempotent(uuid,text,uuid,date,text,numeric,text,text,text) from public,anon,authenticated;
revoke all on function public.create_purchase_order_idempotent(uuid,uuid,date,date,text,numeric,text,jsonb,text) from public,anon,authenticated;
revoke all on function public.receive_purchase_order_idempotent(uuid,uuid,text) from public,anon,authenticated;
revoke all on function public.post_sales_return_idempotent(uuid,uuid,text,text) from public,anon,authenticated;
revoke all on function public.post_expense_idempotent(uuid,text,text,numeric,date,text,uuid,text,text) from public,anon,authenticated;
revoke all on function public.post_manual_journal_idempotent(uuid,date,text,jsonb,text) from public,anon,authenticated;
revoke all on function public.reverse_manual_journal_idempotent(uuid,uuid,text,text) from public,anon,authenticated;

grant execute on function public.post_invoice_idempotent(uuid,uuid,date,text,numeric,text,jsonb,text) to service_role;
grant execute on function public.adjust_stock_idempotent(uuid,uuid,integer,text,text) to service_role;
grant execute on function public.post_payment_idempotent(uuid,text,uuid,date,text,numeric,text,text,text) to service_role;
grant execute on function public.create_purchase_order_idempotent(uuid,uuid,date,date,text,numeric,text,jsonb,text) to service_role;
grant execute on function public.receive_purchase_order_idempotent(uuid,uuid,text) to service_role;
grant execute on function public.post_sales_return_idempotent(uuid,uuid,text,text) to service_role;
grant execute on function public.post_expense_idempotent(uuid,text,text,numeric,date,text,uuid,text,text) to service_role;
grant execute on function public.post_manual_journal_idempotent(uuid,date,text,jsonb,text) to service_role;
grant execute on function public.reverse_manual_journal_idempotent(uuid,uuid,text,text) to service_role;

commit;
