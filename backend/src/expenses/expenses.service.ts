import { BadGatewayException, BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';

type ExpenseRow = {
  id: string;
  supplier_id: string | null;
  category: string;
  description: string;
  amount: string | number;
  expense_date: string;
  status: 'paid' | 'pending';
  created_at: string;
};

@Injectable()
export class ExpensesService {
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
    const params = new URLSearchParams({
      company_id: `eq.${user.companyId}`,
      select: 'id,supplier_id,category,description,amount,expense_date,status,created_at',
      order: 'expense_date.desc,id.desc',
      limit: String(Math.max(1, Math.min(Number(limit) || 100, 200))),
    });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/expenses?${params.toString()}`, { headers: this.headers() });
    if (!response.ok) throw new BadGatewayException(await this.errorMessage(response, 'Unable to load expenses.'));
    const rows = (await response.json()) as ExpenseRow[];
    return rows.map((row) => ({ id: row.id, category: row.category, description: row.description, amount: Number(row.amount), date: row.expense_date, status: row.status, supplierId: row.supplier_id ?? '', createdAt: row.created_at }));
  }

  async post(user: AuthenticatedUser, input: { category: string; description: string; amount: number; date: string; status: 'paid' | 'pending'; supplierId?: string; paymentMethod?: 'cash' | 'bank' | 'card' }) {
    this.assertConfigured();
    if (!input.category?.trim() || !input.description?.trim()) throw new BadRequestException('Category and description are required.');
    if (!Number.isFinite(input.amount) || input.amount <= 0) throw new BadRequestException('Amount must be greater than zero.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new BadRequestException('Invalid expense date.');
    if (!['paid', 'pending'].includes(input.status)) throw new BadRequestException('Invalid expense status.');
    if (input.status === 'pending' && !input.supplierId) throw new BadRequestException('Pending expense requires a supplier.');
    if (input.status === 'paid' && !['cash', 'bank', 'card'].includes(input.paymentMethod ?? '')) throw new BadRequestException('Paid expense requires a payment method.');

    const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/post_expense`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        p_actor_id: user.id,
        p_category: input.category.trim(),
        p_description: input.description.trim(),
        p_amount: input.amount,
        p_expense_date: input.date,
        p_status: input.status,
        p_supplier_id: input.supplierId || null,
        p_payment_method: input.status === 'paid' ? input.paymentMethod : null,
      }),
    });
    if (!response.ok) throw new BadRequestException(await this.errorMessage(response, 'Unable to post expense.'));
    return response.json();
  }
}
