import { BadGatewayException, BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { PaymentMutationResult, PaymentWriteInput } from './payments.types';

type PaymentRow = {
  id: string;
  payment_number: string;
  direction: 'receipt' | 'payment';
  party_type: 'customer' | 'supplier' | 'other';
  customer_id: string | null;
  supplier_id: string | null;
  party_name: string;
  payment_date: string;
  method: 'cash' | 'bank' | 'card' | 'credit';
  amount: string | number;
  reference: string;
  notes: string;
  created_at: string;
};

@Injectable()
export class PaymentsService {
  private readonly supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  private readonly serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  private assertConfigured() { if (!this.supabaseUrl || !this.serviceKey) throw new ServiceUnavailableException('Production database is not configured.'); }
  private headers(extra: Record<string, string> = {}) { const headers: Record<string, string> = { apikey: this.serviceKey!, Accept: 'application/json', ...extra }; if (this.serviceKey?.startsWith('eyJ')) headers.Authorization = `Bearer ${this.serviceKey}`; return headers; }
  private async errorMessage(response: Response, fallback: string) { const raw = await response.text(); try { const parsed = JSON.parse(raw) as { message?: string; details?: string }; return parsed.message ?? parsed.details ?? fallback; } catch { return raw || fallback; } }

  async list(user: AuthenticatedUser, limit = 100) {
    this.assertConfigured();
    const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 200));
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, select: 'id,payment_number,direction,party_type,customer_id,supplier_id,party_name,payment_date,method,amount,reference,notes,created_at', order: 'payment_date.desc,id.desc', limit: String(safeLimit) });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/payments?${params.toString()}`, { headers: this.headers() });
    if (!response.ok) throw new BadGatewayException(await this.errorMessage(response, 'Unable to load payments.'));
    const rows = (await response.json()) as PaymentRow[];
    return rows.map((row) => ({ id: row.id, number: row.payment_number, direction: row.direction, partyType: row.party_type, partyId: row.customer_id ?? row.supplier_id ?? '', partyName: row.party_name, date: row.payment_date, method: row.method, amount: Number(row.amount), reference: row.reference, notes: row.notes, createdAt: row.created_at }));
  }

  async suppliers(user: AuthenticatedUser) {
    this.assertConfigured();
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, status: 'eq.active', select: 'id,name,email,phone,balance,status,notes,created_at', order: 'name.asc', limit: '200' });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/suppliers?${params.toString()}`, { headers: this.headers() });
    if (!response.ok) throw new BadGatewayException(await this.errorMessage(response, 'Unable to load suppliers.'));
    const rows = (await response.json()) as Array<Record<string, unknown>>;
    return rows.map((row) => ({ id: String(row.id), name: String(row.name ?? ''), email: String(row.email ?? ''), phone: String(row.phone ?? ''), balance: Number(row.balance ?? 0), status: row.status, notes: String(row.notes ?? ''), createdAt: String(row.created_at ?? '') }));
  }

  async post(user: AuthenticatedUser, input: PaymentWriteInput, requestKey: string): Promise<PaymentMutationResult> {
    this.assertConfigured();
    if (!['receipt', 'payment'].includes(input.direction)) throw new BadRequestException('Invalid payment direction.');
    if (!input.partyId) throw new BadRequestException('partyId is required.');
    if (!['cash', 'bank', 'card'].includes(input.method)) throw new BadRequestException('Invalid payment method.');
    if (!Number.isFinite(input.amount) || input.amount <= 0) throw new BadRequestException('Amount must be greater than zero.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new BadRequestException('Invalid payment date.');

    const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/post_payment_idempotent`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ p_actor_id: user.id, p_direction: input.direction, p_party_id: input.partyId, p_payment_date: input.date, p_method: input.method, p_amount: input.amount, p_reference: input.reference?.trim() ?? '', p_notes: input.notes?.trim() ?? '', p_request_key: requestKey }),
    });
    if (!response.ok) throw new BadRequestException(await this.errorMessage(response, 'Unable to post payment.'));
    const result = (await response.json()) as { payment_id: string; payment_number: string; amount: number };
    return { paymentId: result.payment_id, paymentNumber: result.payment_number, amount: Number(result.amount) };
  }
}
