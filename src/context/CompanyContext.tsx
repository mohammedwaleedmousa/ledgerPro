import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultDemoCompany, demoCompanyStorageKey, readLocalValue } from "../lib/demo";
import { supabase } from "../lib/supabase";
import type { Company } from "../types/company";
import { useAuth } from "./AuthContext";

type CompanyRecord = {
  id: string;
  name: string;
  plan: Company["plan"];
};

type RemoteCompanyState = {
  userId: string;
  company: Company | null;
  error: string | null;
};

type CompanyContextType = {
  company: Company | null;
  loading: boolean;
  error: string | null;
  refreshCompany: () => Promise<void>;
};

const CompanyContext = createContext<CompanyContextType | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [remoteState, setRemoteState] = useState<RemoteCompanyState>({
    userId: "",
    company: null,
    error: null,
  });

  const loadRemoteCompany = useCallback(async () => {
    if (!supabase || !user || user.mode !== "supabase" || !user.companyId) return;

    const { data, error: companyError } = await supabase
      .from("companies")
      .select("id, name, plan")
      .eq("id", user.companyId)
      .single();

    setRemoteState({
      userId: user.id,
      company: companyError ? null : (data as CompanyRecord),
      error: companyError ? "تعذر تحميل بيانات الشركة." : null,
    });
  }, [user]);

  useEffect(() => {
    if (!supabase || !user || user.mode !== "supabase" || !user.companyId) return;

    let active = true;
    const userId = user.id;
    const companyId = user.companyId;

    void supabase
      .from("companies")
      .select("id, name, plan")
      .eq("id", companyId)
      .single()
      .then(({ data, error: companyError }) => {
        if (!active) return;
        setRemoteState({
          userId,
          company: companyError ? null : (data as CompanyRecord),
          error: companyError ? "تعذر تحميل بيانات الشركة." : null,
        });
      });

    return () => {
      active = false;
    };
  }, [user]);

  const demoCompany = user?.mode === "demo"
    ? readLocalValue<Company>(demoCompanyStorageKey) ?? { ...defaultDemoCompany, id: user.companyId }
    : null;
  const hasCurrentRemoteState = Boolean(user && remoteState.userId === user.id);
  const company = user?.mode === "demo"
    ? demoCompany
    : hasCurrentRemoteState
      ? remoteState.company
      : null;
  const loading = authLoading || Boolean(user?.mode === "supabase" && !hasCurrentRemoteState);
  const error = user?.mode === "supabase" && hasCurrentRemoteState ? remoteState.error : null;

  const value = useMemo(
    () => ({ company, loading, error, refreshCompany: loadRemoteCompany }),
    [company, error, loadRemoteCompany, loading],
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const context = useContext(CompanyContext);

  if (!context) {
    throw new Error("Company context missing");
  }

  return context;
}
