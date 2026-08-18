import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedUser, LedgerRole } from './auth.types';

type SupabaseAuthUser = {
  id: string;
  email?: string;
};

type ProfileRow = {
  company_id: string;
  full_name: string;
  role: LedgerRole;
};

@Injectable()
export class AuthService {
  private readonly supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  private readonly publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  private readonly serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  private assertConfigured() {
    if (!this.supabaseUrl || !this.publishableKey || !this.serviceRoleKey) {
      throw new UnauthorizedException('Backend authentication is not configured.');
    }
  }

  async authenticate(accessToken: string): Promise<AuthenticatedUser> {
    this.assertConfigured();

    const authResponse = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: this.publishableKey!,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!authResponse.ok) {
      throw new UnauthorizedException('Invalid or expired access token.');
    }

    const authUser = (await authResponse.json()) as SupabaseAuthUser;
    if (!authUser.id) throw new UnauthorizedException('Authenticated user is invalid.');

    const profileResponse = await fetch(
      `${this.supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(authUser.id)}&select=company_id,full_name,role&limit=1`,
      {
        headers: {
          apikey: this.serviceRoleKey!,
          Authorization: `Bearer ${this.serviceRoleKey}`,
          Accept: 'application/json',
        },
      },
    );

    if (!profileResponse.ok) {
      throw new UnauthorizedException('Unable to load the user profile.');
    }

    const profiles = (await profileResponse.json()) as ProfileRow[];
    const profile = profiles[0];
    if (!profile?.company_id) {
      throw new UnauthorizedException('User profile is not linked to a company.');
    }

    return {
      id: authUser.id,
      email: authUser.email ?? '',
      companyId: profile.company_id,
      fullName: profile.full_name,
      role: profile.role,
    };
  }
}
