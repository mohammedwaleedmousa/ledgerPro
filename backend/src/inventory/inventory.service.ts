import { BadGatewayException, BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { StockAdjustmentInput, StockAdjustmentResult } from './inventory.types';

type MovementRow = { id: string; product_id: string; movement_type: 'opening' | 'sale' | 'adjustment' | 'purchase' | 'return' | 'transfer_in' | 'transfer_out'; quantity_delta: number; balance_after: number; reference: string; created_at: string };

@Injectable()
export class InventoryService {
  private readonly supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  private readonly serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  private assertConfigured() { if (!this.supabaseUrl || !this.serviceKey) throw new ServiceUnavailableException('Production database is not configured.'); }
  private headers(extra: Record<string, string> = {}) { const headers: Record<string, string> = { apikey: this.serviceKey!, Accept: 'application/json', ...extra }; if (this.serviceKey?.startsWith('eyJ')) headers.Authorization = `Bearer ${this.serviceKey}`; return headers; }
  private async errorMessage(response: Response, fallback: string) { const raw = await response.text(); try { const parsed = JSON.parse(raw) as { message?: string; details?: string }; return parsed.message ?? parsed.details ?? fallback; } catch { return raw || fallback; } }

  async movements(user: AuthenticatedUser, limit = 100) {
    this.assertConfigured();
    const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 200));
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, select: 'id,product_id,movement_type,quantity_delta,balance_after,reference,created_at', order: 'created_at.desc,id.desc', limit: String(safeLimit) });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/inventory_movements?${params.toString()}`, { headers: this.headers() });
    if (!response.ok) throw new BadGatewayException(await this.errorMessage(response, 'Unable to load stock movements.'));
    const rows = (await response.json()) as MovementRow[];
    const productIds = [...new Set(rows.map((row) => row.product_id))];
    const names = new Map<string, string>();
    if (productIds.length) {
      const productParams = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `in.(${productIds.join(',')})`, select: 'id,name' });
      const productsResponse = await fetch(`${this.supabaseUrl}/rest/v1/products?${productParams.toString()}`, { headers: this.headers() });
      if (productsResponse.ok) ((await productsResponse.json()) as Array<{ id: string; name: string }>).forEach((product) => names.set(product.id, product.name));
    }
    return rows.map((row) => ({ id: row.id, productId: row.product_id, productName: names.get(row.product_id) ?? 'منتج', type: row.movement_type === 'transfer_in' || row.movement_type === 'transfer_out' ? 'adjustment' : row.movement_type, quantityDelta: row.quantity_delta, balanceAfter: row.balance_after, reference: row.reference, date: row.created_at }));
  }

  async adjust(user: AuthenticatedUser, input: StockAdjustmentInput, requestKey: string): Promise<StockAdjustmentResult> {
    this.assertConfigured();
    if (!input.productId) throw new BadRequestException('productId is required.');
    if (!Number.isInteger(input.quantityDelta) || input.quantityDelta === 0) throw new BadRequestException('quantityDelta must be a non-zero integer.');
    const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/adjust_stock_idempotent`, {
      method: 'POST', headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ p_actor_id: user.id, p_product_id: input.productId, p_quantity_delta: input.quantityDelta, p_reference: input.reference?.trim() ?? '', p_request_key: requestKey }),
    });
    if (!response.ok) throw new BadRequestException(await this.errorMessage(response, 'Unable to adjust stock.'));
    const result = (await response.json()) as { product_id: string; stock: number; value: number };
    return { productId: result.product_id, stock: Number(result.stock), value: Number(result.value) };
  }
}
