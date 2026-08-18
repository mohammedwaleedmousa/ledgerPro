import { BadGatewayException, BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { ProductMutationResult, ProductWriteInput } from './products.types';

@Injectable()
export class ProductsService {
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

  private validate(input: ProductWriteInput, creating: boolean) {
    if (!input.name?.trim() || input.name.trim().length > 180) throw new BadRequestException('Invalid product name.');
    if (!input.sku?.trim() || input.sku.trim().length > 80) throw new BadRequestException('Invalid SKU.');
    if (!input.categoryId) throw new BadRequestException('categoryId is required.');
    if (!Number.isFinite(input.cost) || input.cost < 0) throw new BadRequestException('cost must be zero or greater.');
    if (!Number.isFinite(input.price) || input.price < 0) throw new BadRequestException('price must be zero or greater.');
    if (!Number.isInteger(input.lowStockThreshold) || input.lowStockThreshold < 0) throw new BadRequestException('lowStockThreshold must be a non-negative integer.');
    if (creating && (!Number.isInteger(input.stock) || (input.stock ?? 0) < 0)) throw new BadRequestException('stock must be a non-negative integer.');
  }

  private async parseError(response: Response, fallback: string) {
    const raw = await response.text();
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw) as { message?: string; details?: string };
      return parsed.message ?? parsed.details ?? fallback;
    } catch {
      return raw.slice(0, 300);
    }
  }

  async create(user: AuthenticatedUser, input: ProductWriteInput): Promise<ProductMutationResult> {
    this.assertConfigured();
    this.validate(input, true);
    const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/create_product`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ p_actor_id: user.id, p_name: input.name.trim(), p_sku: input.sku.trim(), p_category_id: input.categoryId, p_cost: input.cost, p_price: input.price, p_initial_stock: input.stock ?? 0, p_low_stock_threshold: input.lowStockThreshold, p_description: input.description?.trim() ?? '' }),
    });
    if (!response.ok) throw new BadRequestException(await this.parseError(response, 'Unable to create product.'));
    const result = (await response.json()) as { product_id: string };
    return { productId: result.product_id };
  }

  async update(user: AuthenticatedUser, productId: string, input: ProductWriteInput): Promise<ProductMutationResult> {
    this.assertConfigured();
    this.validate(input, false);
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `eq.${productId}` });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/products?${params.toString()}`, {
      method: 'PATCH',
      headers: this.headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
      body: JSON.stringify({ category_id: input.categoryId, name: input.name.trim(), sku: input.sku.trim(), description: input.description?.trim() ?? '', cost: input.cost, price: input.price, low_stock_threshold: input.lowStockThreshold, is_active: input.isActive ?? true }),
    });
    if (!response.ok) throw new BadRequestException(await this.parseError(response, 'Unable to update product.'));
    const rows = (await response.json()) as Array<{ id: string }>;
    if (!rows[0]) throw new NotFoundException('Product not found.');
    return { productId: rows[0].id };
  }

  async deactivate(user: AuthenticatedUser, productId: string): Promise<ProductMutationResult> {
    this.assertConfigured();
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `eq.${productId}` });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/products?${params.toString()}`, { method: 'PATCH', headers: this.headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }), body: JSON.stringify({ is_active: false }) });
    if (!response.ok) throw new BadGatewayException(await this.parseError(response, 'Unable to deactivate product.'));
    const rows = (await response.json()) as Array<{ id: string }>;
    if (!rows[0]) throw new NotFoundException('Product not found.');
    return { productId: rows[0].id };
  }
}
