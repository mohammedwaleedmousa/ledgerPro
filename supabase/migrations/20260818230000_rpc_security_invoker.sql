begin;

alter function public.post_invoice(uuid, uuid, date, text, numeric, text, jsonb) security invoker;
alter function public.create_product(uuid, text, text, uuid, numeric, numeric, integer, integer, text) security invoker;
alter function public.create_customer(uuid, text, text, text, text, text, numeric, text, text) security invoker;
alter function public.adjust_stock(uuid, uuid, integer, text) security invoker;
alter function public.post_payment(uuid, text, uuid, date, text, numeric, text, text) security invoker;
alter function public.create_supplier(uuid, text, text, text, numeric, text, text) security invoker;
alter function public.create_purchase_order(uuid, uuid, date, date, text, numeric, text, jsonb) security invoker;
alter function public.receive_purchase_order(uuid, uuid) security invoker;
alter function public.post_sales_return(uuid, uuid, text) security invoker;
alter function public.post_expense(uuid, text, text, numeric, date, text, uuid, text) security invoker;
alter function public.post_manual_journal(uuid, date, text, jsonb) security invoker;
alter function public.reverse_manual_journal(uuid, uuid, text) security invoker;

-- Service role already owns the required table privileges. Keep public/browser roles locked out.
revoke all on function public.post_invoice(uuid, uuid, date, text, numeric, text, jsonb) from public, anon, authenticated;
revoke all on function public.create_product(uuid, text, text, uuid, numeric, numeric, integer, integer, text) from public, anon, authenticated;
revoke all on function public.create_customer(uuid, text, text, text, text, text, numeric, text, text) from public, anon, authenticated;
revoke all on function public.adjust_stock(uuid, uuid, integer, text) from public, anon, authenticated;
revoke all on function public.post_payment(uuid, text, uuid, date, text, numeric, text, text) from public, anon, authenticated;
revoke all on function public.create_supplier(uuid, text, text, text, numeric, text, text) from public, anon, authenticated;
revoke all on function public.create_purchase_order(uuid, uuid, date, date, text, numeric, text, jsonb) from public, anon, authenticated;
revoke all on function public.receive_purchase_order(uuid, uuid) from public, anon, authenticated;
revoke all on function public.post_sales_return(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.post_expense(uuid, text, text, numeric, date, text, uuid, text) from public, anon, authenticated;
revoke all on function public.post_manual_journal(uuid, date, text, jsonb) from public, anon, authenticated;
revoke all on function public.reverse_manual_journal(uuid, uuid, text) from public, anon, authenticated;

grant execute on function public.post_invoice(uuid, uuid, date, text, numeric, text, jsonb) to service_role;
grant execute on function public.create_product(uuid, text, text, uuid, numeric, numeric, integer, integer, text) to service_role;
grant execute on function public.create_customer(uuid, text, text, text, text, text, numeric, text, text) to service_role;
grant execute on function public.adjust_stock(uuid, uuid, integer, text) to service_role;
grant execute on function public.post_payment(uuid, text, uuid, date, text, numeric, text, text) to service_role;
grant execute on function public.create_supplier(uuid, text, text, text, numeric, text, text) to service_role;
grant execute on function public.create_purchase_order(uuid, uuid, date, date, text, numeric, text, jsonb) to service_role;
grant execute on function public.receive_purchase_order(uuid, uuid) to service_role;
grant execute on function public.post_sales_return(uuid, uuid, text) to service_role;
grant execute on function public.post_expense(uuid, text, text, numeric, date, text, uuid, text) to service_role;
grant execute on function public.post_manual_journal(uuid, date, text, jsonb) to service_role;
grant execute on function public.reverse_manual_journal(uuid, uuid, text) to service_role;

commit;
