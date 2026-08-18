import { BadGatewayException, BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';

type ReturnRow = { id: string; return_number: string; invoice_id: string; customer_id: string; return_date: string; reason: string; total: string | number; status: 'completed'; created_at: string };

@Injectable()
export class ReturnsService {
  private readonly supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  private readonly serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  private assertConfigured() { if (!this.supabaseUrl || !this.serviceKey) throw new ServiceUnavailableException('Production database is not configured.'); }
  private headers(extra: Record<string, string> = {}) { const headers: Record<string, string> = { apikey: this.serviceKey!, Accept: 'application/json', ...extra }; if (this.serviceKey?.startsWith('eyJ')) headers.Authorization = `Bearer ${this.serviceKey}`; return headers; }
  private async errorMessage(response: Response, fallback: string) { const raw = await response.text(); try { const parsed = JSON.parse(raw) as { message?: string; details?: string }; return parsed.message ?? parsed.details ?? fallback; } catch { return raw || fallback; } }

  async list(user: AuthenticatedUser, limit = 100) {
    this.assertConfigured();
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, select: 'id,return_number,invoice_id,customer_id,return_date,reason,total,status,created_at', order: 'return_date.desc,id.desc', limit: String(Math.max(1, Math.min(Number(limit) || 100, 200))) });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/sales_returns?${params.toString()}`, { headers: this.headers() });
    if (!response.ok) throw new BadGatewayException(await this.errorMessage(response, 'Unable to load sales returns.'));
    const rows = (await response.json()) as ReturnRow[];
    const invoiceIds = [...new Set(rows.map((row) => row.invoice_id))];
    const customerIds = [...new Set(rows.map((row) => row.customer_id))];
    const invoiceNumbers = new Map<string, string>();
    const customerNames = new Map<string, string>();
    if (invoiceIds.length) {
      const p = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `in.(${invoiceIds.join(',')})`, select: 'id,invoice_number' });
      const r = await fetch(`${this.supabaseUrl}/rest/v1/invoices?${p.toString()}`, { headers: this.headers() });
      if (r.ok) ((await r.json()) as Array<{ id: string; invoice_number: string }>).forEach((x) => invoiceNumbers.set(x.id, x.invoice_number));
    }
    if (customerIds.length) {
      const p = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `in.(${customerIds.join(',')})`, select: 'id,name' });
      const r = await fetch(`${this.supabaseUrl}/rest/v1/customers?${p.toString()}`, { headers: this.headers() });
      if (r.ok) ((await r.json()) as Array<{ id: string; name: string }>).forEach((x) => customerNames.set(x.id, x.name));
    }
    return rows.map((row) => ({ id: row.id, number: row.return_number, invoiceId: row.invoice_id, invoiceNumber: invoiceNumbers.get(row.invoice_id) ?? '', customerId: row.customer_id, customerName: customerNames.get(row.customer_id) ?? 'عميل', date: row.return_date, reason: row.reason, amount: Number(row.total), status: row.status, createdAt: row.created_at }));
  }

  async post(user: AuthenticatedUser, invoiceId: string, reason: string, requestKey: string) {
    this.assertConfigured();
    if (!invoiceId) throw new BadRequestException('invoiceId is required.');
    if (!reason?.trim()) throw new BadRequestException('Return reason is required.');
    const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/post_sales_return_idempotent`, { method: 'POST', headers: this.headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ p_actor_id: user.id, p_invoice_id: invoiceId, p_reason: reason.trim(), p_request_key: requestKey }) });
    if (!response.ok) throw new BadRequestException(await this.errorMessage(response, 'Unable to post sales return.'));
    return response.json();
  }
}
