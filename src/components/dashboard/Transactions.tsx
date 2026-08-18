import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatDate } from "../../lib/format";
import { appPaths } from "../../routes/navigation";

export default function Transactions() {
  const { invoices, expenses } = useErp();
  const transactions = [
    ...invoices.map((invoice) => ({ id: invoice.id, name: `${invoice.number} — ${invoice.customerName}`, amount: invoice.total, date: invoice.createdAt, kind: "income" as const })),
    ...expenses.map((expense) => ({ id: expense.id, name: expense.description, amount: expense.amount, date: expense.createdAt, kind: "expense" as const })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)] sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="text-xs font-extrabold text-slate-900">آخر العمليات</h3><p className="mt-1 text-[9px] text-slate-400">أحدث حركات الدخل والمصروفات</p></div><Link to={appPaths.invoices} className="text-[10px] font-bold text-blue-600">عرض الفواتير</Link></div>
      <div>
        {transactions.map((item) => {
          const Icon = item.kind === "income" ? ArrowDownLeft : ArrowUpRight;
          return <div key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-4 border-t border-slate-100 py-3"><div className="flex min-w-0 items-center gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.kind === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}><Icon size={14} /></span><div className="min-w-0"><p className="truncate text-[11px] font-bold text-slate-700">{item.name}</p><p className="mt-1 text-[9px] text-slate-400">{formatDate(item.date)}</p></div></div><span className={`shrink-0 text-[11px] font-extrabold tabular-nums ${item.kind === "income" ? "text-emerald-600" : "text-rose-600"}`}>{item.kind === "income" ? "+" : "-"}{formatCurrency(item.amount)}</span></div>;
        })}
        {transactions.length === 0 && <p className="py-8 text-center text-xs text-slate-400">لا توجد عمليات بعد.</p>}
      </div>
    </article>
  );
}
