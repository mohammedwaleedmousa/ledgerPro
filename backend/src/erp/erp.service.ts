import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';

export type PageResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

type CategoryRow = { id: string; name: string; description: string; is_active: boolean; created_at: string };
type ProductRow = { id: string; name: string; sku: string; category_id: string | null; cost: string | number; price: string | number; stock: number; low_stock_threshold: number; description: string; is_active: boolean; created_at: string };
type CustomerRow = { id: string; name: string; email: string; phone: string; tax_number: string; address: string; balance: string | number; status: 'active' | 'inactive'; notes: string; created_at: string };
type InvoiceRow = { id: string; customer_id: string; invoice_number: string; issue_date: string; payment_method: 'cash' | 'bank' | 'card' | 'credit'; status: 'draft' | 'sent' | 'paid' | 'overdue'; notes: string; subtotal: string | number; tax_rate: string | number; tax_amount: string | number; total: string | number; created_at: string };
type InvoiceItemRow = { id: string; invoice_id: string; product_id: string; product_name: string; quantity: number; unit_price: string | number; unit_cost: string | number; total: string | number };
type SettingsRow = { currency: 'USD' | 'YER' | 'SAR'; tax_rate: string | number; invoice_prefix: string; quotation_prefix: string; purchase_prefix: string; fiscal_year_start: string };

function asNumber(value: string | number | null | undefined) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function positiveInt(value: unknown, fallback: number, max: number) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric <= 0) return fallback;
  return Math.min(numeric, max);
}

function cleanSearch(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.replace(/[^\p{L}\p{N}\s_-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
}

function mapProduct(row: ProductRow) {
  return { id: row.id, name: row.name, sku: row.sku, categoryId: row.category_id ?? '', cost: asNumber(row.cost), price: asNumber(row.price), stock: row.stock, lowStockThreshold: row.low_stock_threshold, description: row.description, isActive: row.is_active, createdAt: row.created_at };
}

function mapCustomer(row: CustomerRow) {
  return { id: row.id, name: row.name, email: row.email, phone: row.phone, taxNumber: row.tax_number, address: row.address, balance: asNumber(row.balance), status: row.status, notes: row.notes, createdAt: row.created_at };
}

@Injectable()
export class ErpService {
  private readonly supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  private readonly serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  private assertConfigured() {
    if (!this.supabaseUrl || !this.serviceRoleKey) throw new ServiceUnavailableException('Production database is not configured.');
  }

  private async request<T>(table: string, params: URLSearchParams, count = false): Promise<{ data: T; total: number }> {
    this.assertConfigured();
    const response = await fetch(`${this.supabaseUrl}/rest/v1/${table}?${params.toString()}`, {
      headers: {
        apikey: this.serviceRoleKey!,
        Authorization: `Bearer ${this.serviceRoleKey}`,
        Accept: 'application/json',
        ...(count ? { Prefer: 'count=exact' } : {}),
      },
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new BadGatewayException(`Database read failed for ${table}: ${detail.slice(0, 240)}`);
    }
    const contentRange = response.headers.get('content-range');
    const totalText = contentRange?.split('/')[1];
    const total = totalText && totalText !== '*' ? Number(totalText) : 0;
    return { data: (await response.json()) as T, total: Number.isFinite(total) ? total : 0 };
  }

  async bootstrap(user: AuthenticatedUser) {
    const companyFilter = `eq.${user.companyId}`;
    const categoriesParams = new URLSearchParams({ company_id: companyFilter, select: 'id,name,description,is_active,created_at', order: 'name.asc' });
    const settingsParams = new URLSearchParams({ company_id: companyFilter, select: 'currency,tax_rate,invoice_prefix,quotation_prefix,purchase_prefix,fiscal_year_start', limit: '1' });
    const [categoriesResult, settingsResult] = await Promise.all([
      this.request<CategoryRow[]>('categories', categoriesParams),
      this.request<SettingsRow[]>('company_settings', settingsParams),
    ]);
    const settings = settingsResult.data[0];
    if (!settings) throw new BadGatewayException('Company settings are missing.');
    return {
      categories: categoriesResult.data.map((row) => ({ id: row.id, name: row.name, description: row.description, isActive: row.is_active, createdAt: row.created_at })),
      settings: { currency: settings.currency, taxRate: asNumber(settings.tax_rate), invoicePrefix: settings.invoice_prefix, quotationPrefix: settings.quotation_prefix, purchasePrefix: settings.purchase_prefix, fiscalYearStart: settings.fiscal_year_start },
    };
  }

  async products(user: AuthenticatedUser, query: Record<string, unknown>): Promise<PageResult<unknown>> {
    const page = positiveInt(query.page, 1, 100000);
    const limit = positiveInt(query.limit, 50, 100);
    const search = cleanSearch(query.search);
    const categoryId = typeof query.categoryId === 'string' ? query.categoryId.trim() : '';
    const offset = (page - 1) * limit;
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, select: 'id,name,sku,category_id,cost,price,stock,low_stock_threshold,description,is_active,created_at', order: 'created_at.desc,id.desc', limit: String(limit), offset: String(offset) });
    if (categoryId) params.set('category_id', `eq.${categoryId}`);
    if (search) params.set('or', `(name.ilike.*${search}*,sku.ilike.*${search}*)`);
    const result = await this.request<ProductRow[]>('products', params, true);
    return { page, limit, total: result.total, items: result.data.map(mapProduct) };
  }

  async productDetails(user: AuthenticatedUser, productId: string) {
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `eq.${productId}`, select: 'id,name,sku,category_id,cost,price,stock,low_stock_threshold,description,is_active,created_at', limit: '1' });
    const result = await this.request<ProductRow[]>('products', params);
    return result.data[0] ? mapProduct(result.data[0]) : null;
  }

  async customers(user: AuthenticatedUser, query: Record<string, unknown>): Promise<PageResult<unknown>> {
    const page = positiveInt(query.page, 1, 100000);
    const limit = positiveInt(query.limit, 50, 100);
    const search = cleanSearch(query.search);
    const offset = (page - 1) * limit;
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, select: 'id,name,email,phone,tax_number,address,balance,status,notes,created_at', order: 'created_at.desc,id.desc', limit: String(limit), offset: String(offset) });
    if (search) params.set('or', `(name.ilike.*${search}*,phone.ilike.*${search}*,email.ilike.*${search}*)`);
    const result = await this.request<CustomerRow[]>('customers', params, true);
    return { page, limit, total: result.total, items: result.data.map(mapCustomer) };
  }

  async customerDetails(user: AuthenticatedUser, customerId: string) {
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `eq.${customerId}`, select: 'id,name,email,phone,tax_number,address,balance,status,notes,created_at', limit: '1' });
    const result = await this.request<CustomerRow[]>('customers', params);
    return result.data[0] ? mapCustomer(result.data[0]) : null;
  }

  async invoices(user: AuthenticatedUser, query: Record<string, unknown>): Promise<PageResult<unknown>> {
    const page = positiveInt(query.page, 1, 100000);
    const limit = positiveInt(query.limit, 50, 100);
    const offset = (page - 1) * limit;
    const status = typeof query.status === 'string' ? query.status.trim() : '';
    const customerId = typeof query.customerId === 'string' ? query.customerId.trim() : '';
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, select: 'id,customer_id,invoice_number,issue_date,payment_method,status,notes,subtotal,tax_rate,tax_amount,total,created_at', order: 'issue_date.desc,id.desc', limit: String(limit), offset: String(offset) });
    if (['draft', 'sent', 'paid', 'overdue'].includes(status)) params.set('status', `eq.${status}`);
    if (customerId) params.set('customer_id', `eq.${customerId}`);
    const result = await this.request<InvoiceRow[]>('invoices', params, true);
    const customerIds = [...new Set(result.data.map((row) => row.customer_id))];
    const customerNames = new Map<string, string>();
    if (customerIds.length > 0) {
      const customerParams = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `in.(${customerIds.join(',')})`, select: 'id,name' });
      const names = await this.request<Array<{ id: string; name: string }>>('customers', customerParams);
      names.data.forEach((customer) => customerNames.set(customer.id, customer.name));
    }
    return {
      page,
      limit,
      total: result.total,
      items: result.data.map((row) => ({ id: row.id, number: row.invoice_number, customerId: row.customer_id, customerName: customerNames.get(row.customer_id) ?? 'عميل', issueDate: row.issue_date, paymentMethod: row.payment_method, status: row.status, notes: row.notes, items: [], subtotal: asNumber(row.subtotal), taxRate: asNumber(row.tax_rate), taxAmount: asNumber(row.tax_amount), total: asNumber(row.total), createdAt: row.created_at })),
    };
  }

  async invoiceDetails(user: AuthenticatedUser, invoiceId: string) {
    const invoicesParams = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `eq.${invoiceId}`, select: 'id,customer_id,invoice_number,issue_date,payment_method,status,notes,subtotal,tax_rate,tax_amount,total,created_at', limit: '1' });
    const itemsParams = new URLSearchParams({ company_id: `eq.${user.companyId}`, invoice_id: `eq.${invoiceId}`, select: 'id,invoice_id,product_id,product_name,quantity,unit_price,unit_cost,total', order: 'created_at.asc' });
    const [invoiceResult, itemsResult] = await Promise.all([
      this.request<InvoiceRow[]>('invoices', invoicesParams),
      this.request<InvoiceItemRow[]>('invoice_items', itemsParams),
    ]);
    const row = invoiceResult.data[0];
    if (!row) return null;
    const customerParams = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `eq.${row.customer_id}`, select: 'id,name', limit: '1' });
    const customerResult = await this.request<Array<{ id: string; name: string }>>('customers', customerParams);
    return {
      id: row.id,
      number: row.invoice_number,
      customerId: row.customer_id,
      customerName: customerResult.data[0]?.name ?? 'عميل',
      issueDate: row.issue_date,
      paymentMethod: row.payment_method,
      status: row.status,
      notes: row.notes,
      subtotal: asNumber(row.subtotal),
      taxRate: asNumber(row.tax_rate),
      taxAmount: asNumber(row.tax_amount),
      total: asNumber(row.total),
      createdAt: row.created_at,
      items: itemsResult.data.map((item) => ({ id: item.id, productId: item.product_id, productName: item.product_name, quantity: item.quantity, unitPrice: asNumber(item.unit_price), unitCost: asNumber(item.unit_cost), total: asNumber(item.total) })),
    };
  }
}
