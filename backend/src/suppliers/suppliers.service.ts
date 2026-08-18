import { BadGatewayException, BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { SupplierMutationResult, SupplierWriteInput } from './suppliers.types';

type SupplierRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: string | number;
  status: 'active' | 'inactive';
  notes: string;
  created_at: string;
};

@Injectable()
export class SuppliersService {
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

  private validate(input: SupplierWriteInput, creating: boolean) {
    if (!input.name?.trim() || input.name.trim().length > 180) throw new BadRequestException('Invalid supplier name.');
    if (!['active', 'inactive'].includes(input.status)) throw new BadRequestException('Invalid supplier status.');
    if (creating && (!Number.isFinite(input.balance ?? 0) || (input.balance ?? 0) < 0)) throw new BadRequestException('Opening balance must be zero or greater.');
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

  async list(user: AuthenticatedUser, limit = 200) {
    this.assertConfigured();
    const safeLimit = Math.max(1, Math.min(Number(limit) || 200, 200));
    const params = new URLSearchParams({
      company_id: `eq.${user.companyId}`,
      select: 'id,name,email,phone,balance,status,notes,created_at',
      order: 'name.asc,id.asc',
      limit: String(safeLimit),
    });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/suppliers?${params.toString()}`, { headers: this.headers() });
    if (!response.ok) throw new BadGatewayException(await this.errorMessage(response, 'Unable to load suppliers.'));
    const rows = (await response.json()) as SupplierRow[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      balance: Number(row.balance),
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
    }));
  }

  async create(user: AuthenticatedUser, input: SupplierWriteInput): Promise<SupplierMutationResult> {
    this.assertConfigured();
    this.validate(input, true);
    const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/create_supplier`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        p_actor_id: user.id,
        p_name: input.name.trim(),
        p_email: input.email?.trim() ?? '',
        p_phone: input.phone?.trim() ?? '',
        p_opening_balance: input.balance ?? 0,
        p_status: input.status,
        p_notes: input.notes?.trim() ?? '',
      }),
    });
    if (!response.ok) throw new BadRequestException(await this.errorMessage(response, 'Unable to create supplier.'));
    const result = (await response.json()) as { supplier_id: string };
    return { supplierId: result.supplier_id };
  }

  async update(user: AuthenticatedUser, supplierId: string, input: SupplierWriteInput): Promise<SupplierMutationResult> {
    this.assertConfigured();
    this.validate(input, false);
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `eq.${supplierId}` });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/suppliers?${params.toString()}`, {
      method: 'PATCH',
      headers: this.headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
      body: JSON.stringify({
        name: input.name.trim(),
        email: input.email?.trim() ?? '',
        phone: input.phone?.trim() ?? '',
        status: input.status,
        notes: input.notes?.trim() ?? '',
      }),
    });
    if (!response.ok) throw new BadRequestException(await this.errorMessage(response, 'Unable to update supplier.'));
    const rows = (await response.json()) as Array<{ id: string }>;
    if (!rows[0]) throw new NotFoundException('Supplier not found.');
    return { supplierId: rows[0].id };
  }

  async deactivate(user: AuthenticatedUser, supplierId: string): Promise<SupplierMutationResult> {
    this.assertConfigured();
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `eq.${supplierId}` });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/suppliers?${params.toString()}`, {
      method: 'PATCH',
      headers: this.headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
      body: JSON.stringify({ status: 'inactive' }),
    });
    if (!response.ok) throw new BadRequestException(await this.errorMessage(response, 'Unable to deactivate supplier.'));
    const rows = (await response.json()) as Array<{ id: string }>;
    if (!rows[0]) throw new NotFoundException('Supplier not found.');
    return { supplierId: rows[0].id };
  }
}
