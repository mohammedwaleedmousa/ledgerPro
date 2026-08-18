import { supabase } from './supabase';

const apiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '');

export const isProductionApiConfigured = Boolean(apiUrl);

async function accessToken() {
  if (!supabase) throw new Error('Supabase authentication is not configured.');
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error('انتهت جلسة المستخدم. سجّل الدخول مجددًا.');
  return token;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!apiUrl) {
    throw new Error('واجهة LedgerPro الخلفية غير مهيأة. أضف VITE_API_URL.');
  }

  const token = await accessToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${apiUrl}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = `تعذر تنفيذ الطلب (${response.status}).`;
    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(payload.message)) message = payload.message.join('، ');
      else if (payload.message) message = payload.message;
    } catch {
      // Keep the stable Arabic fallback when the backend returned non-JSON content.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
