import { useEffect, useState } from "react";
import InvoiceHeader from "../../components/invoices/InvoiceHeader";
import InvoiceStats from "../../components/invoices/InvoiceStats";
import InvoiceTable from "../../components/invoices/InvoiceTable";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import type { Invoice } from "../../types/erp";

type PageResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export default function Invoices() {
  const { user } = useAuth();
  const isProductionMode = user?.mode === "supabase";
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(isProductionMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isProductionMode) return;
    let active = true;

    async function loadInvoices() {
      setLoading(true);
      setError(null);
      try {
        const result = await apiRequest<PageResult<Invoice>>("/erp/invoices?limit=100&page=1");
        if (active) setInvoices(result.items);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "تعذر تحميل الفواتير من الخادم.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadInvoices();
    return () => {
      active = false;
    };
  }, [isProductionMode]);

  return (
    <div className="space-y-4">
      <InvoiceHeader search={search} onSearchChange={setSearch} />

      {isProductionMode && <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-[11px] font-medium text-emerald-800">الفواتير المعروضة هنا محمّلة من قاعدة بيانات الشركة، وتغيير الحالة محمي مؤقتًا حتى إضافة مسار محاسبي مخصص.</div>}
      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-500">جارٍ تحميل الفواتير من الخادم...</div>
      ) : (
        <>
          <InvoiceStats invoices={isProductionMode ? invoices : undefined} />
          <InvoiceTable search={search} invoices={isProductionMode ? invoices : undefined} readOnlyStatus={isProductionMode} />
        </>
      )}
    </div>
  );
}
