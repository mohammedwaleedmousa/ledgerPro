import { useEffect, useState } from "react";
import CustomerHeader from "../../components/customers/CustomerHeader";
import CustomerStats from "../../components/customers/CustomerStats";
import CustomerTable from "../../components/customers/CustomerTable";
import { useAuth } from "../../context/AuthContext";
import { useErp } from "../../context/ErpContext";
import { apiRequest } from "../../lib/api";
import type { Customer, Invoice } from "../../types/erp";

type PageResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export default function Customers() {
  const { user } = useAuth();
  const erp = useErp();
  const isProductionMode = user?.mode === "supabase";
  const [search, setSearch] = useState("");
  const [productionCustomers, setProductionCustomers] = useState<Customer[]>([]);
  const [productionInvoices, setProductionInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(isProductionMode);
  const [error, setError] = useState<string | null>(null);

  async function loadProductionCustomers() {
    const [customers, invoices] = await Promise.all([
      apiRequest<PageResult<Customer>>("/erp/customers?limit=100&page=1"),
      apiRequest<PageResult<Invoice>>("/erp/invoices?limit=100&page=1"),
    ]);
    setProductionCustomers(customers.items);
    setProductionInvoices(invoices.items);
  }

  useEffect(() => {
    if (!isProductionMode) return;
    let active = true;

    async function loadCustomers() {
      setLoading(true);
      setError(null);
      try {
        const [customers, invoices] = await Promise.all([
          apiRequest<PageResult<Customer>>("/erp/customers?limit=100&page=1"),
          apiRequest<PageResult<Invoice>>("/erp/invoices?limit=100&page=1"),
        ]);
        if (!active) return;
        setProductionCustomers(customers.items);
        setProductionInvoices(invoices.items);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "تعذر تحميل العملاء من الخادم.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCustomers();
    return () => {
      active = false;
    };
  }, [isProductionMode]);

  async function handleDeactivate(customer: Customer) {
    await apiRequest(`/customers/${customer.id}`, { method: "DELETE" });
    await loadProductionCustomers();
  }

  const customers = isProductionMode ? productionCustomers : erp.customers;
  const invoices = isProductionMode ? productionInvoices : erp.invoices;

  return (
    <div className="space-y-4">
      <CustomerHeader search={search} onSearchChange={setSearch} />

      {isProductionMode && <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-[11px] font-medium text-emerald-800">العملاء والأرصدة المعروضة هنا محمّلة من قاعدة بيانات الشركة. الإضافة والتعديل والتعطيل تمر عبر الـBackend.</div>}
      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-500">جارٍ تحميل العملاء من الخادم...</div>
      ) : (
        <>
          <CustomerStats customers={customers} />
          <CustomerTable search={search} customers={customers} invoices={invoices} onDeactivate={isProductionMode ? handleDeactivate : undefined} />
        </>
      )}
    </div>
  );
}
