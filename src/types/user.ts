export type UserRole = "owner" | "admin" | "accountant" | "employee";
export type AuthMode = "demo" | "supabase";

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  mode: AuthMode;
}

export type RegisterInput = {
  companyName: string;
  name: string;
  email: string;
  password: string;
};

export type RegisterResult = {
  needsEmailConfirmation: boolean;
};
