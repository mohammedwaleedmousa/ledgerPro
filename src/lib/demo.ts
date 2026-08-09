import type { Company } from "../types/company";
import type { User } from "../types/user";

export const demoSessionStorageKey = "ledgerpro:demo-session:v1";
export const demoCompanyStorageKey = "ledgerpro:demo-company:v1";

export const defaultDemoUser: User = {
  id: "demo-owner",
  companyId: "demo-company",
  name: "محمد وليد",
  email: "demo@ledgerpro.app",
  role: "owner",
  mode: "demo",
};

export const defaultDemoCompany: Company = {
  id: "demo-company",
  name: "شركة LedgerPro التجريبية",
  plan: "pro",
};

export function readLocalValue<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export function writeLocalValue(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}
