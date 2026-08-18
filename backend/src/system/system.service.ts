import { BadGatewayException, BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';

type CategoryRow={id:string;name:string;description:string;is_active:boolean;created_at:string};
type WarehouseRow={id:string;name:string;location:string;is_default:boolean;is_active:boolean;created_at:string};
type InventoryRow={warehouse_id:string;product_id:string;quantity:number};
type ProductCostRow={id:string;cost:string|number};
type AuditRow={id:string;actor_id:string|null;action:string;entity_type:string;entity_id:string|null;created_at:string};
type SettingsRow={currency:'USD'|'YER'|'SAR';tax_rate:string|number;invoice_prefix:string;quotation_prefix:string;purchase_prefix:string;fiscal_year_start:string};

@Injectable()
export class SystemService {
  private readonly supabaseUrl=process.env.SUPABASE_URL?.replace(/\/$/,'');
  private readonly serviceKey=process.env.SUPABASE_SECRET_KEY??process.env.SUPABASE_SERVICE_ROLE_KEY;
  private assertConfigured(){if(!this.supabaseUrl||!this.serviceKey)throw new ServiceUnavailableException('Production database is not configured.');}
  private headers(extra:Record<string,string>={}){const h:Record<string,string>={apikey:this.serviceKey!,Accept:'application/json',...extra};if(this.serviceKey?.startsWith('eyJ'))h.Authorization=`Bearer ${this.serviceKey}`;return h;}
  private async errorMessage(response:Response,fallback:string){const raw=await response.text();try{const parsed=JSON.parse(raw) as {message?:string;details?:string};return parsed.message??parsed.details??fallback;}catch{return raw||fallback;}}
  private async rpc(path:string,body:Record<string,unknown>){this.assertConfigured();const response=await fetch(`${this.supabaseUrl}/rest/v1/rpc/${path}`,{method:'POST',headers:this.headers({'Content-Type':'application/json'}),body:JSON.stringify(body)});if(!response.ok)throw new BadRequestException(await this.errorMessage(response,`Unable to execute ${path}.`));return response.json();}

  async categories(user:AuthenticatedUser){
    this.assertConfigured();const p=new URLSearchParams({company_id:`eq.${user.companyId}`,select:'id,name,description,is_active,created_at',order:'name.asc'});const r=await fetch(`${this.supabaseUrl}/rest/v1/categories?${p}`,{headers:this.headers()});if(!r.ok)throw new BadGatewayException(await this.errorMessage(r,'Unable to load categories.'));return (await r.json() as CategoryRow[]).map(x=>({id:x.id,name:x.name,description:x.description,isActive:x.is_active,createdAt:x.created_at}));
  }
  createCategory(user:AuthenticatedUser,name:string,description:string){return this.rpc('create_category',{p_actor_id:user.id,p_name:name,p_description:description});}
  deactivateCategory(user:AuthenticatedUser,id:string){return this.rpc('deactivate_category',{p_actor_id:user.id,p_category_id:id});}

  async warehouses(user:AuthenticatedUser){
    this.assertConfigured();
    const wp=new URLSearchParams({company_id:`eq.${user.companyId}`,select:'id,name,location,is_default,is_active,created_at',order:'is_default.desc,name.asc'});
    const ip=new URLSearchParams({company_id:`eq.${user.companyId}`,select:'warehouse_id,product_id,quantity'});
    const pp=new URLSearchParams({company_id:`eq.${user.companyId}`,select:'id,cost'});
    const [wr,ir,pr]=await Promise.all([fetch(`${this.supabaseUrl}/rest/v1/warehouses?${wp}`,{headers:this.headers()}),fetch(`${this.supabaseUrl}/rest/v1/product_inventory?${ip}`,{headers:this.headers()}),fetch(`${this.supabaseUrl}/rest/v1/products?${pp}`,{headers:this.headers()})]);
    if(!wr.ok||!ir.ok||!pr.ok)throw new BadGatewayException('Unable to load warehouse balances.');
    const warehouses=await wr.json() as WarehouseRow[],inventory=await ir.json() as InventoryRow[],products=await pr.json() as ProductCostRow[],costs=new Map(products.map(x=>[x.id,Number(x.cost)]));
    return warehouses.map(w=>{const rows=inventory.filter(i=>i.warehouse_id===w.id);return{id:w.id,name:w.name,location:w.location,isDefault:w.is_default,isActive:w.is_active,createdAt:w.created_at,stockUnits:rows.reduce((s,i)=>s+i.quantity,0),productCount:rows.filter(i=>i.quantity>0).length,inventoryValue:rows.reduce((s,i)=>s+i.quantity*(costs.get(i.product_id)??0),0)};});
  }
  createWarehouse(user:AuthenticatedUser,name:string,location:string){return this.rpc('create_warehouse',{p_actor_id:user.id,p_name:name,p_location:location});}
  transferStock(user:AuthenticatedUser,input:{productId:string;fromWarehouseId:string;toWarehouseId:string;quantity:number;reference?:string}){if(!Number.isInteger(input.quantity)||input.quantity<=0)throw new BadRequestException('Quantity must be a positive integer.');return this.rpc('transfer_stock',{p_actor_id:user.id,p_product_id:input.productId,p_from_warehouse_id:input.fromWarehouseId,p_to_warehouse_id:input.toWarehouseId,p_quantity:input.quantity,p_reference:input.reference?.trim()??''});}

  async settings(user:AuthenticatedUser){
    this.assertConfigured();const p=new URLSearchParams({company_id:`eq.${user.companyId}`,select:'currency,tax_rate,invoice_prefix,quotation_prefix,purchase_prefix,fiscal_year_start',limit:'1'});const r=await fetch(`${this.supabaseUrl}/rest/v1/company_settings?${p}`,{headers:this.headers()});if(!r.ok)throw new BadGatewayException(await this.errorMessage(r,'Unable to load settings.'));const row=(await r.json() as SettingsRow[])[0];if(!row)throw new BadGatewayException('Company settings are missing.');return{currency:row.currency,taxRate:Number(row.tax_rate),invoicePrefix:row.invoice_prefix,quotationPrefix:row.quotation_prefix,purchasePrefix:row.purchase_prefix,fiscalYearStart:row.fiscal_year_start};
  }
  updateSettings(user:AuthenticatedUser,input:{currency:'USD'|'YER'|'SAR';taxRate:number;invoicePrefix:string;quotationPrefix:string;purchasePrefix:string;fiscalYearStart:string}){return this.rpc('update_company_settings',{p_actor_id:user.id,p_currency:input.currency,p_tax_rate:input.taxRate,p_invoice_prefix:input.invoicePrefix,p_quotation_prefix:input.quotationPrefix,p_purchase_prefix:input.purchasePrefix,p_fiscal_year_start:input.fiscalYearStart});}

  async activity(user:AuthenticatedUser,limit=100){
    this.assertConfigured();const p=new URLSearchParams({company_id:`eq.${user.companyId}`,select:'id,actor_id,action,entity_type,entity_id,created_at',order:'created_at.desc,id.desc',limit:String(Math.max(1,Math.min(Number(limit)||100,200)))});const r=await fetch(`${this.supabaseUrl}/rest/v1/audit_logs?${p}`,{headers:this.headers()});if(!r.ok)throw new BadGatewayException(await this.errorMessage(r,'Unable to load audit activity.'));const rows=await r.json() as AuditRow[];const actorIds=[...new Set(rows.map(x=>x.actor_id).filter((x):x is string=>Boolean(x)))],actors=new Map<string,string>();if(actorIds.length){const ap=new URLSearchParams({company_id:`eq.${user.companyId}`,id:`in.(${actorIds.join(',')})`,select:'id,full_name'});const ar=await fetch(`${this.supabaseUrl}/rest/v1/profiles?${ap}`,{headers:this.headers()});if(ar.ok)(await ar.json() as Array<{id:string;full_name:string}>).forEach(x=>actors.set(x.id,x.full_name));}return rows.map(x=>({id:x.id,action:x.action,entity:x.entity_type,entityId:x.entity_id??'',actor:x.actor_id?actors.get(x.actor_id)??'مستخدم':'النظام',createdAt:x.created_at}));
  }

  createAccount(user:AuthenticatedUser,input:{code:string;name:string;type:string}){return this.rpc('create_account',{p_actor_id:user.id,p_code:input.code,p_name:input.name,p_account_type:input.type});}
}
