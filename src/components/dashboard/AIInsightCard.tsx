import { ArrowUpLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useErp } from "../../context/ErpContext";
import { formatCurrency } from "../../lib/format";
import { appPaths } from "../../routes/navigation";

export default function AIInsightCard() {
  const { products, invoices } = useErp();
  const lowStock = products.filter((product) => product.stock <= product.lowStockThreshold);
  const outstanding = invoices.filter((invoice) => invoice.status !== "paid").reduce((sum, invoice) => sum + invoice.total, 0);
  const insight = lowStock.length > 0
    ? `لديك ${lowStock.length} منتجات وصلت إلى حد المخزون المنخفض. راجع المخزون لتجنب توقف المبيعات.`
    : `وضع المخزون جيد. إجمالي المبالغ غير المحصلة حاليًا هو ${formatCurrency(outstanding)}.`;

  return (
    <article className="relative min-h-[255px] overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className="absolute -bottom-14 -left-12 h-48 w-48 rounded-full bg-blue-50 blur-2xl" />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Sparkles size={16} /></span><h3 className="text-sm font-extrabold text-slate-900">مساعد LedgerPro الذكي</h3></div>
        <Link to={appPaths.ai} aria-label="فتح المساعد الذكي" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-blue-600"><ArrowUpLeft size={16} /></Link>
      </div>

      <p className="relative mt-4 max-w-[78%] text-[11px] leading-5 text-slate-500">{insight}</p>

      <div className="relative mt-5 flex items-end justify-between gap-4">
        <Link to={appPaths.ai} className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600">عرض التحليل الكامل</Link>
        <div className="relative ml-2 h-24 w-24 shrink-0">
          <span className="absolute inset-x-2 bottom-0 h-4 rounded-full bg-blue-900/15 blur-md" />
          <span className="absolute inset-2 rounded-full bg-[radial-gradient(circle_at_32%_24%,#dbeafe_0%,#60a5fa_22%,#2563eb_52%,#172554_100%)] shadow-[inset_-12px_-14px_24px_rgba(15,23,42,.28),0_14px_25px_rgba(37,99,235,.24)]" />
          <span className="absolute left-8 top-5 h-4 w-3 -rotate-12 rounded-full bg-white/65 blur-[2px]" />
        </div>
      </div>
    </article>
  );
}
