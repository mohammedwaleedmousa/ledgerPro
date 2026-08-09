import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  defaultDemoCompany,
  defaultDemoUser,
  demoCompanyStorageKey,
  demoSessionStorageKey,
  readLocalValue,
  writeLocalValue,
} from "../lib/demo";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { RegisterInput, RegisterResult, User, UserRole } from "../types/user";

type ProfileRecord = {
  company_id: string;
  full_name: string;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  isSupabaseConfigured: boolean;
  isDemoAvailable: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function isUserRole(value: unknown): value is UserRole {
  return value === "owner" || value === "admin" || value === "accountant" || value === "employee";
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `demo-${Date.now()}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    supabase ? null : readLocalValue<User>(demoSessionStorageKey),
  );
  const [loading, setLoading] = useState(() => Boolean(supabase));
  const [error, setError] = useState<string | null>(null);
  const isDemoAvailable = !isSupabaseConfigured || import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_MODE === "true";

  const hydrateSupabaseUser = useCallback(async (authUser: SupabaseUser): Promise<User> => {
    if (!supabase) {
      throw new Error("تعذر الاتصال بخدمة المصادقة.");
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("company_id, full_name, role")
      .eq("id", authUser.id)
      .single();

    if (profileError) {
      throw new Error("تم تسجيل الدخول، لكن ملف الشركة غير جاهز. طبّق مخطط قاعدة البيانات أولًا.");
    }

    const profile = data as ProfileRecord;

    return {
      id: authUser.id,
      companyId: profile.company_id,
      name: profile.full_name || authUser.email?.split("@")[0] || "مستخدم",
      email: authUser.email ?? "",
      role: isUserRole(profile.role) ? profile.role : "employee",
      mode: "supabase",
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    const client = supabase;

    async function syncUser(authUser: SupabaseUser | null) {
      if (!active) return;

      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const appUser = await hydrateSupabaseUser(authUser);
        if (active) {
          setUser(appUser);
          setError(null);
        }
      } catch (syncError) {
        if (active) {
          setUser(null);
          setError(syncError instanceof Error ? syncError.message : "تعذر تحميل جلسة المستخدم.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void client.auth.getUser().then(({ data, error: userError }) => {
      if (userError) {
        setError("انتهت الجلسة أو تعذر التحقق منها. سجّل الدخول مجددًا.");
        setLoading(false);
        return;
      }

      void syncUser(data.user);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void syncUser(session?.user ?? null);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [hydrateSupabaseUser]);

  async function login(email: string, password: string) {
    setError(null);

    if (!supabase) {
      throw new Error("استخدم زر الدخول التجريبي، أو أضف إعدادات Supabase في ملف .env.local.");
    }

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (loginError) throw loginError;
    if (!data.user) throw new Error("لم يتم العثور على المستخدم بعد تسجيل الدخول.");

    setUser(await hydrateSupabaseUser(data.user));
  }

  async function loginDemo() {
    if (!isDemoAvailable) throw new Error("وضع التجربة غير مفعل.");

    writeLocalValue(demoSessionStorageKey, defaultDemoUser);
    if (!readLocalValue(demoCompanyStorageKey)) {
      writeLocalValue(demoCompanyStorageKey, defaultDemoCompany);
    }
    setError(null);
    setUser(defaultDemoUser);
  }

  async function register(input: RegisterInput): Promise<RegisterResult> {
    setError(null);

    if (!supabase) {
      const companyId = createId();
      const demoUser: User = {
        id: createId(),
        companyId,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: "owner",
        mode: "demo",
      };

      writeLocalValue(demoCompanyStorageKey, {
        id: companyId,
        name: input.companyName.trim(),
        plan: "free",
      });
      writeLocalValue(demoSessionStorageKey, demoUser);
      setUser(demoUser);
      return { needsEmailConfirmation: false };
    }

    const { data, error: registerError } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        data: {
          company_name: input.companyName.trim(),
          full_name: input.name.trim(),
        },
      },
    });

    if (registerError) throw registerError;
    if (!data.user) throw new Error("تعذر إنشاء المستخدم.");

    if (data.session) {
      setUser(await hydrateSupabaseUser(data.user));
    }

    return { needsEmailConfirmation: !data.session };
  }

  async function logout() {
    if (user?.mode === "supabase" && supabase) {
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;
    }

    window.localStorage.removeItem(demoSessionStorageKey);
    setUser(null);
    setError(null);
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    isSupabaseConfigured,
    isDemoAvailable,
    login,
    loginDemo,
    register,
    logout,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be inside AuthProvider");
  }

  return context;
}
