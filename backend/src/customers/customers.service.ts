import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CustomerMutationResult, CustomerWriteInput } from './customers.types';

@Injectable()
export class CustomersService {
  private readonly supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  private readonly serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  private assertConfigured() {
    if (!this.supabaseUrl || !this.serviceRoleKey) throw new ServiceUnavailableException('Production database is not configured.');
  }

  private validate(input: CustomerWriteInput, creating: boolean) {
    if (!input.name?.trim() || input.name.trim().length > 180) throw new BadRequestException('Invalid customer name.');
    if (!['active', 'inactive'].includes(input.status)) throw new BadRequestException('Invalid customer status.');
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

  async create(user: AuthenticatedUser, input: CustomerWriteInput): Promise<CustomerMutationResult> {
    this.assertConfigured();
    this.validate(input, true);
    const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/create_customer`, {
      method: 'POST',
      headers: {
        apikey: this.serviceRoleKey!,
        Authorization: `Bearer ${this.serviceRoleKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        p_actor_id: user.id,
        p_name: input.name.trim(),
        p_email: input.email?.trim() ?? '',
        p_phone: input.phone?.trim() ?? '',
        p_tax_number: input.taxNumber?.trim() ?? '',
        p_address: input.address?.trim() ?? '',
        p_opening_balance: input.balance ?? 0,
        p_status: input.status,
        p_notes: input.notes?.trim() ?? '',
      }),
    });
    if (!response.ok) throw new BadRequestException(await this.errorMessage(response, 'Unable to create customer.'));
    const result = (await response.json()) as { customer_id: string };
    return { customerId: result.customer_id };
  }

  async update(user: AuthenticatedUser, customerId: string, input: CustomerWriteInput): Promise<CustomerMutationResult> {
    this.assertConfigured();
    this.validate(input, false);
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `eq.${customerId}` });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/customers?${params.toString()}`, {
      method: 'PATCH',
      headers: {
        apikey: this.serviceRoleKey!,
        Authorization: `Bearer ${this.serviceRoleKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        name: input.name.trim(),
        email: input.email?.trim() ?? '',
        phone: input.phone?.trim() ?? '',
        tax_number: input.taxNumber?.trim() ?? '',
        address: input.address?.trim() ?? '',
        status: input.status,
        notes: input.notes?.trim() ?? '',
      }),
    });
    if (!response.ok) throw new BadRequestException(await this.errorMessage(response, 'Unable to update customer.'));
    const rows = (await response.json()) as Array<{ id: string }>;
    if (!rows[0]) throw new NotFoundException('Customer not found.');
    return { customerId: rows[0].id };
  }

  async deactivate(user: AuthenticatedUser, customerId: string): Promise<CustomerMutationResult> {
    this.assertConfigured();
    const params = new URLSearchParams({ company_id: `eq.${user.companyId}`, id: `eq.${customerId}` });
    const response = await fetch(`${this.supabaseUrl}/rest/v1/customers?${params.toString()}`, {
      method: 'PATCH',
      headers: {
        apikey: this.serviceRoleKey!, Authorization: `Bearer ${this.serviceRoleKey}`,
        'Content-Type': 'application/json', Accept: 'application/json', Prefer: 'return=representation',
      },
      body: JSON.stringify({ status: 'inactive' }),
    });
    if (!response.ok) throw new BadRequestException(await this.errorMessage(response, 'Unable to deactivate customer.'));
    const rows = (await response.json()) as Array<{ id: string }>;
    if (!rows[0]) throw new NotFoundException('Customer not found.');
    return { customerId: rows[0].id };
  }
}
