import { createContext, useContext, useState } from "react";
import type { User } from "../types/user";

type AuthContextType = {
  user: User | null;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<User | null>(null);


  function login() {
    setUser({
      id: "1",
      name: "محمد",
      email: "user@ledgerpro.com",
      role: "owner",
    });
  }


  function logout() {
    setUser(null);
  }


  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be inside AuthProvider");
  }

  return context;
}