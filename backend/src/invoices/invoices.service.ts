import { BadRequestException, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { PostInvoiceInput, PostedInvoiceResult } from './invoices.types';

@Injectable()
export class InvoicesService {
  private readonly supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  private readonly serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  private assertConfigured() {
    if (!this.supabaseUrl || !this.serviceKey) throw new BadRequestException('Backend database connection is not configured.');
  }

  private headers(extra: Record<string, string> = {}) {
    const headers: Record<string, string> = { apikey: this.serviceKey!, Accept: 'application/json', ...extra };
    if (this.serviceKey?.startsWith('eyJ')) headers.Authorization = `Bearer ${this.serviceKey}`;
    return headers;
  }

  private validate(input: PostInvoiceInput) {
    if (!input.customerId) throw new BadRequestException('customerId is required.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.issueDate)) throw new BadRequestException('issueDate must be YYYY-MM-DD.');
    if (!['cash', 'bank', 'card', 'credit'].includes(input.paymentMethod)) throw new BadRequestException('Invalid paymentMethod.');
    if (!Number.isFinite(input.taxRate) || input.taxRate < 0 || input.taxRate > 100) throw new BadRequestException('taxRate must be between 0 and 100.');
    if (!Array.isArray(input.items) || input.items.length === 0) throw new BadRequestException('At least one invoice item is required.');
    const ids = new Set<string>();
    for (const item of input.items) {
      if (!item.productId) throw new BadRequestException('Each item requires productId.');
      if (ids.has(item.productId)) throw new BadRequestException('Duplicate products are not allowed in one invoice.');
      ids.add(item.productId);
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) throw new BadRequestException('Item quantity must be a positive integer.');
      if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) throw new BadRequestException('Item unitPrice must be zero or greater.');
    }
  }

  async postInvoice(user: AuthenticatedUser, input: PostInvoiceInput): Promise<PostedInvoiceResult> {
    this.assertConfigured();
    this.validate(input);
    const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/post_invoice`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        p_actor_id: user.id,
        p_customer_id: input.customerId,
        p_issue_date: input.issueDate,
        p_payment_method: input.paymentMethod,
        p_tax_rate: input.taxRate,
        p_notes: input.notes?.trim() ?? '',
        p_items: input.items.map((item) => ({ product_id: item.productId, quantity: item.quantity, unit_price: item.unitPrice })),
      }),
    });
    const raw = await response.text();
    if (!response.ok) {
      let message = 'Unable to post invoice.';
      try { const parsed = JSON.parse(raw) as { message?: string; details?: string }; message = parsed.message ?? parsed.details ?? message; } catch { if (raw) message = raw; }
      throw new BadRequestException(message);
    }
    const parsed = JSON.parse(raw) as { invoice_id: string; invoice_number: string; total: number | string };
    return { invoiceId: parsed.invoice_id, invoiceNumber: parsed.invoice_number, total: Number(parsed.total) };
  }
}
