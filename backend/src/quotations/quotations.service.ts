import { BadGatewayException, BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';

type QuoteRow={id:string;customer_id:string;quotation_number:string;issue_date:string;expiry_date:string;status:'draft'|'sent'|'accepted'|'expired'|'rejected';notes:string;subtotal:string|number;tax_rate:string|number;tax_amount:string|number;total:string|number;converted_invoice_id:string|null;created_at:string};
type ItemRow={id:string;quotation_id:string;product_id:string;product_name:string;quantity:number;unit_price:string|number;unit_cost:string|number;total:string|number};

@Injectable()
export class QuotationsService {
  private readonly supabaseUrl=process.env.SUPABASE_URL?.replace(/\/$/,'');
  private readonly serviceKey=process.env.SUPABASE_SECRET_KEY??process.env.SUPABASE_SERVICE_ROLE_KEY;
  private assertConfigured(){if(!this.supabaseUrl||!this.serviceKey)throw new ServiceUnavailableException('Production database is not configured.');}
  private headers(extra:Record<string,string>={}){const h:Record<string,string>={apikey:this.serviceKey!,Accept:'application/json',...extra};if(this.serviceKey?.startsWith('eyJ'))h.Authorization=`Bearer ${this.serviceKey}`;return h;}
  private async err(res:Response,fallback:string){const raw=await res.text();try{const p=JSON.parse(raw) as {message?:string;details?:string};return p.message??p.details??fallback;}catch{return raw||fallback;}}

  async list(user:AuthenticatedUser,limit=100){
    this.assertConfigured();
    const p=new URLSearchParams({company_id:`eq.${user.companyId}`,select:'id,customer_id,quotation_number,issue_date,expiry_date,status,notes,subtotal,tax_rate,tax_amount,total,converted_invoice_id,created_at',order:'issue_date.desc,id.desc',limit:String(Math.max(1,Math.min(Number(limit)||100,200)))});
    const res=await fetch(`${this.supabaseUrl}/rest/v1/quotations?${p}`,{headers:this.headers()});
    if(!res.ok)throw new BadGatewayException(await this.err(res,'Unable to load quotations.'));
    const rows=await res.json() as QuoteRow[];
    const customerIds=[...new Set(rows.map(x=>x.customer_id))], names=new Map<string,string>(), invoiceNumbers=new Map<string,string>();
    if(customerIds.length){const cp=new URLSearchParams({company_id:`eq.${user.companyId}`,id:`in.(${customerIds.join(',')})`,select:'id,name'});const cr=await fetch(`${this.supabaseUrl}/rest/v1/customers?${cp}`,{headers:this.headers()});if(cr.ok)(await cr.json() as Array<{id:string;name:string}>).forEach(x=>names.set(x.id,x.name));}
    const quoteIds=rows.map(x=>x.id), byQuote=new Map<string,ItemRow[]>();
    if(quoteIds.length){const ip=new URLSearchParams({company_id:`eq.${user.companyId}`,quotation_id:`in.(${quoteIds.join(',')})`,select:'id,quotation_id,product_id,product_name,quantity,unit_price,unit_cost,total',order:'created_at.asc'});const ir=await fetch(`${this.supabaseUrl}/rest/v1/quotation_items?${ip}`,{headers:this.headers()});if(ir.ok)(await ir.json() as ItemRow[]).forEach(x=>byQuote.set(x.quotation_id,[...(byQuote.get(x.quotation_id)??[]),x]));}
    const invoiceIds=rows.map(x=>x.converted_invoice_id).filter((x):x is string=>Boolean(x));
    if(invoiceIds.length){const ip=new URLSearchParams({company_id:`eq.${user.companyId}`,id:`in.(${invoiceIds.join(',')})`,select:'id,invoice_number'});const ir=await fetch(`${this.supabaseUrl}/rest/v1/invoices?${ip}`,{headers:this.headers()});if(ir.ok)(await ir.json() as Array<{id:string;invoice_number:string}>).forEach(x=>invoiceNumbers.set(x.id,x.invoice_number));}
    return rows.map(row=>({id:row.id,number:row.quotation_number,customerId:row.customer_id,customerName:names.get(row.customer_id)??'عميل',issueDate:row.issue_date,expiryDate:row.expiry_date,status:row.status,notes:row.notes,items:(byQuote.get(row.id)??[]).map(i=>({id:i.id,productId:i.product_id,productName:i.product_name,quantity:i.quantity,unitPrice:Number(i.unit_price),unitCost:Number(i.unit_cost),total:Number(i.total)})),subtotal:Number(row.subtotal),taxRate:Number(row.tax_rate),taxAmount:Number(row.tax_amount),total:Number(row.total),convertedInvoiceId:row.converted_invoice_id??undefined,convertedInvoiceNumber:row.converted_invoice_id?invoiceNumbers.get(row.converted_invoice_id):undefined,createdAt:row.created_at}));
  }

  async create(user:AuthenticatedUser,input:{customerId:string;issueDate:string;expiryDate:string;status:'draft'|'sent';taxRate:number;notes?:string;items:Array<{productId:string;quantity:number;unitPrice:number}>},requestKey:string){
    this.assertConfigured(); if(!input.customerId||!input.items?.length)throw new BadRequestException('Customer and items are required.');
    const res=await fetch(`${this.supabaseUrl}/rest/v1/rpc/create_quotation_idempotent`,{method:'POST',headers:this.headers({'Content-Type':'application/json'}),body:JSON.stringify({p_actor_id:user.id,p_customer_id:input.customerId,p_issue_date:input.issueDate,p_expiry_date:input.expiryDate,p_status:input.status,p_tax_rate:input.taxRate,p_notes:input.notes?.trim()??'',p_items:input.items.map(i=>({product_id:i.productId,quantity:i.quantity,unit_price:i.unitPrice})),p_request_key:requestKey})});
    if(!res.ok)throw new BadRequestException(await this.err(res,'Unable to create quotation.'));return res.json();
  }

  async updateStatus(user:AuthenticatedUser,id:string,status:string){
    this.assertConfigured(); if(!['draft','sent','accepted','expired','rejected'].includes(status))throw new BadRequestException('Invalid quotation status.');
    const p=new URLSearchParams({company_id:`eq.${user.companyId}`,id:`eq.${id}`,converted_invoice_id:'is.null'});
    const res=await fetch(`${this.supabaseUrl}/rest/v1/quotations?${p}`,{method:'PATCH',headers:this.headers({'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify({status})});
    if(!res.ok)throw new BadRequestException(await this.err(res,'Unable to update quotation status.'));const rows=await res.json() as Array<{id:string}>;if(!rows[0])throw new BadRequestException('Quotation cannot be updated.');return {quotationId:rows[0].id};
  }

  async convert(user:AuthenticatedUser,id:string,paymentMethod:string,requestKey:string){
    this.assertConfigured(); if(!['cash','bank','card','credit'].includes(paymentMethod))throw new BadRequestException('Invalid payment method.');
    const res=await fetch(`${this.supabaseUrl}/rest/v1/rpc/convert_quotation_to_invoice_idempotent`,{method:'POST',headers:this.headers({'Content-Type':'application/json'}),body:JSON.stringify({p_actor_id:user.id,p_quotation_id:id,p_payment_method:paymentMethod,p_request_key:requestKey})});
    if(!res.ok)throw new BadRequestException(await this.err(res,'Unable to convert quotation.'));return res.json();
  }
}
