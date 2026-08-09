export type UserRole = 
  | "owner"
  | "admin"
  | "accountant"
  | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}