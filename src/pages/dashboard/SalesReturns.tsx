import { PackageCheck, RotateCcw, Undo2 } from "lucide-react";
import { useState } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Table from "../../components/common/Table";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatDate, formatNumber } from "../../lib/format";

export default function SalesReturns() {
  const { invoices, salesReturns, createSalesReturn } = useErp();
  const [invoiceId, setInvoiceId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const availableInvoices = invoices.filter((invoice) => invoice.status !== "draft" && !salesReturns.some((item) => item.invoiceId === invoice.id));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = createSalesReturn(invoiceId, reason);
      setInvoiceId(""); setReason(""); setError(null); setMessage(`تم إنشاء المرتجع ${result.number} وإعادة المنتجات إلى المخزون.`);
    } catch (returnError) {
      setMessage(null);
      setError(returnError instanceof Error ? returnError.message : "تعذر تسجيل المرتجع.");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="مرتجعات المبيعات" description="اعكس الفاتورة وأعد كمياتها إلى المخزون مع تسجيل الأثر المالي." eyebrow="المبيعات" />
      {message && <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[11px] font-bold text-emerald-700">{message}</div>}

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard title="عدد المرتجعات" value={formatNumber(salesReturns.length)} icon={Undo2} tone="rose" />
        <StatCard title="قيمة المرتجعات" value={formatCurrency(salesReturns.reduce((sum, item) => sum + item.amount, 0))} icon={RotateCcw} tone="amber" />
        <StatCard title="فواتير متاحة للإرجاع" value={formatNumber(availableInvoices.length)} icon={PackageCheck} />
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div><h2 className="text-sm font-extrabold text-slate-900">تسجيل مرتجع كامل</h2><p className="mt-1 text-[10px] leading-5 text-slate-400">في نسخة MVP يُرجع النظام كامل بنود الفاتورة. المرتجع الجزئي سيكون ضمن مرحلة الفوترة المتقدمة.</p></div>
          {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-[11px] font-medium text-rose-700">{error}</div>}
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
            <div className="space-y-1.5"><label htmlFor="return-invoice" className="block text-[11px] font-bold text-slate-600">الفاتورة</label><select id="return-invoice" value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none" required><option value="">اختر الفاتورة</option>{availableInvoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.number} · {invoice.customerName} · {formatCurrency(invoice.total)}</option>)}</select></div>
            <div className="space-y-1.5"><label htmlFor="return-reason" className="block text-[11px] font-bold text-slate-600">سبب الإرجاع</label><input id="return-reason" value={reason} onChange={(event) => setReason(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 px-3 text-xs outline-none focus:border-blue-500" placeholder="عيب، طلب العميل، خطأ في الطلب..." required /></div>
            <Button type="submit"><RotateCcw size={15} />تنفيذ المرتجع</Button>
          </div>
        </Card>
      </form>

      <Table minWidth="760px">
        <thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">رقم المرتجع</th><th className="p-4">الفاتورة</th><th className="p-4">العميل</th><th className="p-4">التاريخ</th><th className="p-4">السبب</th><th className="p-4">القيمة</th><th className="p-4">الحالة</th></tr></thead>
        <tbody>{salesReturns.map((item) => <tr key={item.id} className="border-b border-slate-100 last:border-0"><td className="p-4 font-mono text-[11px] font-bold text-blue-700">{item.number}</td><td className="p-4 text-[10px] font-bold text-slate-600">{item.invoiceNumber}</td><td className="p-4 text-xs font-bold text-slate-700">{item.customerName}</td><td className="p-4 text-[10px] text-slate-500">{formatDate(item.date)}</td><td className="max-w-60 truncate p-4 text-[10px] text-slate-500">{item.reason}</td><td className="p-4 text-xs font-extrabold text-rose-600">{formatCurrency(item.amount)}</td><td className="p-4"><Badge>مكتمل</Badge></td></tr>)}{salesReturns.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-xs text-slate-400">لا توجد مرتجعات حتى الآن.</td></tr>}</tbody>
      </Table>
    </div>
  );
}
