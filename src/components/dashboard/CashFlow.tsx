import { useErp } from "../../context/ErpContext";
import { formatCurrency } from "../../lib/format";

export default function CashFlow() {
  const { invoices, expenses } = useErp();
  const revenue = invoices.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.total, 0);
  const paidExpenses = expenses.filter((expense) => expense.status === "paid").reduce((sum, expense) => sum + expense.amount, 0);
  const cashFlow = revenue - paidExpenses;
  const maxValue = Math.max(revenue, paidExpenses, 1);

  return (
    <article className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)] sm:p-5">
      <div className="flex items-center justify-between gap-3"><div><h3 className="text-xs font-extrabold text-slate-900">التدفق النقدي</h3><p className="mt-1 text-[9px] text-slate-400">مقارنة المقبوضات والمدفوعات</p></div><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${cashFlow >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{cashFlow >= 0 ? "تدفق موجب" : "تدفق سالب"}</span></div>
      <div className="mt-4"><p className="text-[28px] font-black tracking-tight text-slate-950 tabular-nums">{formatCurrency(cashFlow)}</p><p className="mt-1 text-[9px] text-slate-400">الرصيد التشغيلي الحالي</p></div>
      <div className="mt-5 grid h-28 grid-cols-2 items-end gap-5 rounded-xl border border-slate-100 bg-slate-50/60 px-5 pb-3 pt-4">
        <div className="flex h-full flex-col justify-end gap-2"><span className="mx-auto w-8 rounded-t-lg bg-blue-600 shadow-[0_6px_12px_rgba(37,99,235,.2)]" style={{ height: `${Math.max(12, (revenue / maxValue) * 64)}px` }} /><span className="text-center text-[9px] font-semibold text-slate-500">إيرادات</span></div>
        <div className="flex h-full flex-col justify-end gap-2"><span className="mx-auto w-8 rounded-t-lg bg-slate-300" style={{ height: `${Math.max(12, (paidExpenses / maxValue) * 64)}px` }} /><span className="text-center text-[9px] font-semibold text-slate-500">مصروفات</span></div>
      </div>
    </article>
  );
}
