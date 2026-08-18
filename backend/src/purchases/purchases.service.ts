import { BadGatewayException, BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { PurchaseOrderWriteInput } from './purchases.types';

type PurchaseOrderRow = {
  id: string;
  supplier_id: string;
  purchase_number: string;
  issue_date: string;
  expected_date: string;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  notes: string;
  subtotal: string | number;
  tax_rate: string | number;
  tax_amount: string | number;
  total: string | number;
  created_at: string;
};

type PurchaseItemRow = {
  purchase_order_id: string;
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_cost: string | number;
  total: string | number;
};

@Injectable()
export class PurchasesService {
  private readonly supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  private readonly serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  private assertConfigured() {
    if (!this.supabaseUrl || !this.serviceKey) throw new ServiceUnavailableException('Production database is not configured.');
  }

  private headers(extra: Record<string, string> = {}) {
    const headers: Record<string, string> = { apikey: this.serviceKey!, Accept: 'application/json', ...extra };
    if (this.serviceKey?.startsWith('eyJ')) headers.Authorization = `Bearer ${this.serviceKey}`;
    return headers;
  }

  private async errorMessage(response: Response, fallback: string) {
    const raw = await response.text();
    try {
      const parsed = JSON.parse(raw) as { message?: string; details?: string };
      return parsed.message ?? parsed.details ?? fallback;
    } catch {
      return raw || fallback;
    }
  }

  async list(user: AuthenticatedUser, limit = 100) {
    this.assertConfigured();
    const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 200));
    const params = new URLSearchParams({
      company_id: `eq.${user.companyId}`,
      select: 'id,supplier_id,purchase_number,issue_date,expected_date,status,notes,subtotal,tax_rate,tax_amount,total,created_at',
      order: 'issue_date.desc,id.desc',
      limit: String(safeLimit),
    });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/purchase_orders?${params.toString()}`, { headers: this.headers() });
    if (!response.ok) throw new BadGatewayException(await this.errorMessage(response, 'Unable to load purchase orders.'));
    const rows = (await response.json()) as PurchaseOrderRow[];

    const supplierIds = [...new Set(rows.map((row) => row.supplier_id))];
    const supplierNames = new Map<string, string>();
    if (supplierIds.length) {
      const supplierParams = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `in.(${supplierIds.join(',')})`, select: 'id,name' });
      const supplierResponse = await fetch(`${this.supabaseUrl}/rest/v1/suppliers?${supplierParams.toString()}`, { headers: this.headers() });
      if (supplierResponse.ok) {
        const suppliers = (await supplierResponse.json()) as Array<{ id: string; name: string }>;
        suppliers.forEach((supplier) => supplierNames.set(supplier.id, supplier.name));
      }
    }

    const orderIds = rows.map((row) => row.id);
    const itemsByOrder = new Map<string, PurchaseItemRow[]>();
    if (orderIds.length) {
      const itemParams = new URLSearchParams({
        company_id: `eq.${user.companyId}`,
        purchase_order_id: `in.(${orderIds.join(',')})`,
        select: 'id,purchase_order_id,product_id,product_name,quantity,unit_cost,total',
        order: 'created_at.asc',
      });
      const itemResponse = await fetch(`${this.supabaseUrl}/rest/v1/purchase_order_items?${itemParams.toString()}`, { headers: this.headers() });
      if (itemResponse.ok) {
        const items = (await itemResponse.json()) as PurchaseItemRow[];
        items.forEach((item) => itemsByOrder.set(item.purchase_order_id, [...(itemsByOrder.get(item.purchase_order_id) ?? []), item]));
      }
    }

    return rows.map((row) => ({
      id: row.id,
      number: row.purchase_number,
      supplierId: row.supplier_id,
      supplierName: supplierNames.get(row.supplier_id) ?? 'مورد',
      issueDate: row.issue_date,
      expectedDate: row.expected_date,
      status: row.status,
      notes: row.notes,
      items: (itemsByOrder.get(row.id) ?? []).map((item) => ({ id: item.id, productId: item.product_id, productName: item.product_name, quantity: item.quantity, unitCost: Number(item.unit_cost), total: Number(item.total) })),
      subtotal: Number(row.subtotal),
      taxRate: Number(row.tax_rate),
      taxAmount: Number(row.tax_amount),
      total: Number(row.total),
      createdAt: row.created_at,
    }));
  }

  async create(user: AuthenticatedUser, input: PurchaseOrderWriteInput) {
    this.assertConfigured();
    if (!input.supplierId) throw new BadRequestException('supplierId is required.');
    if (!['draft', 'ordered'].includes(input.status)) throw new BadRequestException('Invalid purchase order status.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.issueDate) || !/^\d{4}-\d{2}-\d{2}$/.test(input.expectedDate)) throw new BadRequestException('Invalid purchase dates.');
    if (!Number.isFinite(input.taxRate) || input.taxRate < 0 || input.taxRate > 100) throw new BadRequestException('Invalid tax rate.');
    if (!Array.isArray(input.items) || !input.items.length) throw new BadRequestException('Purchase order requires at least one item.');
    const seen = new Set<string>();
    for (const item of input.items) {
      if (!item.productId || seen.has(item.productId)) throw new BadRequestException('Purchase products must be unique.');
      seen.add(item.productId);
      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.unitCost) || item.unitCost < 0) throw new BadRequestException('Invalid purchase item.');
    }

    const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/create_purchase_order`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        p_actor_id: user.id,
        p_supplier_id: input.supplierId,
        p_issue_date: input.issueDate,
        p_expected_date: input.expectedDate,
        p_status: input.status,
        p_tax_rate: input.taxRate,
        p_notes: input.notes?.trim() ?? '',
        p_items: input.items.map((item) => ({ product_id: item.productId, quantity: item.quantity, unit_cost: item.unitCost })),
      }),
    });
    if (!response.ok) throw new BadRequestException(await this.errorMessage(response, 'Unable to create purchase order.'));
    return response.json();
  }

  async receive(user: AuthenticatedUser, purchaseOrderId: string) {
    this.assertConfigured();
    const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/receive_purchase_order`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ p_actor_id: user.id, p_purchase_order_id: purchaseOrderId }),
    });
    if (!response.ok) throw new BadRequestException(await this.errorMessage(response, 'Unable to receive purchase order.'));
    return response.json();
  }

  async markOrdered(user: AuthenticatedUser, purchaseOrderId: string) {
    this.assertConfigured();
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `eq.${purchaseOrderId}`, status: 'eq.draft' });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/purchase_orders?${params.toString()}`, {
      method: 'PATCH',
      headers: this.headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
      body: JSON.stringify({ status: 'ordered' }),
    });
    if (!response.ok) throw new BadGatewayException(await this.errorMessage(response, 'Unable to mark purchase order as ordered.'));
    const rows = (await response.json()) as Array<{ id: string }>;
    if (!rows[0]) throw new BadRequestException('Only draft purchase orders can be marked ordered.');
    return { purchaseOrderId: rows[0].id };
  }
}
