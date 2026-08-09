import { createContext, useContext, useState } from "react";
import type { Company } from "../types/company";

const CompanyContext = createContext<Company | null>(null);


export function CompanyProvider({ children }: { children: React.ReactNode }) {

  const [company] = useState<Company>({
    id: "company-1",
    name: "LedgerPro Demo",
    plan: "pro",
  });


  return (
    <CompanyContext.Provider value={company}>
      {children}
    </CompanyContext.Provider>
  );
}


export function useCompany() {

  const company = useContext(CompanyContext);

  if (!company) {
    throw new Error("Company context missing");
  }

  return company;
}