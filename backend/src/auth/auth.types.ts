export type LedgerRole =
  | 'owner'
  | 'admin'
  | 'accountant'
  | 'sales'
  | 'inventory'
  | 'viewer'
  | 'employee';

export type AuthenticatedUser = {
  id: string;
  email: string;
  companyId: string;
  fullName: string;
  role: LedgerRole;
};
