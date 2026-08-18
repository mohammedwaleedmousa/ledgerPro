import { BadGatewayException, BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { ManualJournalInput } from './journal.types';

type AccountRow = { id: string; code: string; name: string; account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'; balance: string | number; is_active: boolean; created_at: string };
type JournalRow = { id: string; journal_number: string; entry_date: string; description: string; status: 'posted' | 'reversed'; total_debit: string | number; total_credit: string | number; reversal_of_id: string | null; is_manual: boolean; created_at: string };
type JournalLineRow = { id: string; journal_entry_id: string; account_id: string; debit: string | number; credit: string | number };

@Injectable()
export class JournalService {
  private readonly supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  private readonly serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  private assertConfigured() { if (!this.supabaseUrl || !this.serviceKey) throw new ServiceUnavailableException('Production database is not configured.'); }
  private headers(extra: Record<string, string> = {}) { const headers: Record<string, string> = { apikey: this.serviceKey!, Accept: 'application/json', ...extra }; if (this.serviceKey?.startsWith('eyJ')) headers.Authorization = `Bearer ${this.serviceKey}`; return headers; }
  private async errorMessage(response: Response, fallback: string) { const raw = await response.text(); try { const parsed = JSON.parse(raw) as { message?: string; details?: string }; return parsed.message ?? parsed.details ?? fallback; } catch { return raw || fallback; } }

  async accounts(user: AuthenticatedUser) {
    this.assertConfigured();
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, is_active: 'eq.true', select: 'id,code,name,account_type,balance,is_active,created_at', order: 'code.asc' });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/accounts?${params.toString()}`, { headers: this.headers() });
    if (!response.ok) throw new BadGatewayException(await this.errorMessage(response, 'Unable to load accounts.'));
    const rows = (await response.json()) as AccountRow[];
    return rows.map((row) => ({ id: row.id, code: row.code, name: row.name, type: row.account_type, balance: Number(row.balance), isActive: row.is_active, createdAt: row.created_at }));
  }

  async list(user: AuthenticatedUser, limit = 100) {
    this.assertConfigured();
    const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 200));
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, select: 'id,journal_number,entry_date,description,status,total_debit,total_credit,reversal_of_id,is_manual,created_at', order: 'entry_date.desc,id.desc', limit: String(safeLimit) });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/journal_entries?${params.toString()}`, { headers: this.headers() });
    if (!response.ok) throw new BadGatewayException(await this.errorMessage(response, 'Unable to load journal entries.'));
    const entries = (await response.json()) as JournalRow[];
    const ids = entries.map((entry) => entry.id);
    const linesByEntry = new Map<string, JournalLineRow[]>();
    const accountNames = new Map<string, string>();
    if (ids.length) {
      const lineParams = new URLSearchParams({ company_id: `eq.${user.companyId}`, journal_entry_id: `in.(${ids.join(',')})`, select: 'id,journal_entry_id,account_id,debit,credit', order: 'created_at.asc' });
      const lineResponse = await fetch(`${this.supabaseUrl}/rest/v1/journal_lines?${lineParams.toString()}`, { headers: this.headers() });
      if (lineResponse.ok) {
        const lines = (await lineResponse.json()) as JournalLineRow[];
        lines.forEach((line) => linesByEntry.set(line.journal_entry_id, [...(linesByEntry.get(line.journal_entry_id) ?? []), line]));
        const accountIds = [...new Set(lines.map((line) => line.account_id))];
        if (accountIds.length) {
          const accountParams = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `in.(${accountIds.join(',')})`, select: 'id,name' });
          const accountResponse = await fetch(`${this.supabaseUrl}/rest/v1/accounts?${accountParams.toString()}`, { headers: this.headers() });
          if (accountResponse.ok) ((await accountResponse.json()) as Array<{ id: string; name: string }>).forEach((account) => accountNames.set(account.id, account.name));
        }
      }
    }
    return entries.map((entry) => ({
      id: entry.id,
      number: entry.journal_number,
      date: entry.entry_date,
      description: entry.description,
      status: entry.status,
      totalDebit: Number(entry.total_debit),
      totalCredit: Number(entry.total_credit),
      reversalOfId: entry.reversal_of_id ?? undefined,
      isManual: entry.is_manual,
      createdAt: entry.created_at,
      lines: (linesByEntry.get(entry.id) ?? []).map((line) => ({ id: line.id, accountId: line.account_id, accountName: accountNames.get(line.account_id) ?? 'حساب', debit: Number(line.debit), credit: Number(line.credit) })),
    }));
  }

  async post(user: AuthenticatedUser, input: ManualJournalInput) {
    this.assertConfigured();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new BadRequestException('Invalid journal date.');
    if (!input.description?.trim()) throw new BadRequestException('Journal description is required.');
    if (!Array.isArray(input.lines) || input.lines.length < 2) throw new BadRequestException('Journal requires at least two lines.');
    const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/post_manual_journal`, { method: 'POST', headers: this.headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ p_actor_id: user.id, p_entry_date: input.date, p_description: input.description.trim(), p_lines: input.lines.map((line) => ({ account_id: line.accountId, debit: line.debit, credit: line.credit })) }) });
    if (!response.ok) throw new BadRequestException(await this.errorMessage(response, 'Unable to post manual journal.'));
    return response.json();
  }

  async reverse(user: AuthenticatedUser, journalEntryId: string, reason: string) {
    this.assertConfigured();
    if (!reason?.trim()) throw new BadRequestException('Reversal reason is required.');
    const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/reverse_manual_journal`, { method: 'POST', headers: this.headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ p_actor_id: user.id, p_journal_entry_id: journalEntryId, p_reason: reason.trim() }) });
    if (!response.ok) throw new BadRequestException(await this.errorMessage(response, 'Unable to reverse journal.'));
    return response.json();
  }
}
