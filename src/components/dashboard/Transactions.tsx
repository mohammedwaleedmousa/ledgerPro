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
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <div className="mb-5 flex items-center justify-between"><h3 className="text-lg font-bold text-gray-900">آخر العمليات</h3><Link to={appPaths.invoices} className="text-sm text-blue-600">عرض الفواتير</Link></div>
      <div className="space-y-3">
        {transactions.map((item) => <div key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4"><div className="min-w-0"><p className="truncate text-sm font-medium text-gray-700">{item.name}</p><p className="mt-1 text-xs text-gray-400">{formatDate(item.date)}</p></div><span className={`shrink-0 font-semibold ${item.kind === "income" ? "text-emerald-600" : "text-red-600"}`}>{item.kind === "income" ? "+" : "-"}{formatCurrency(item.amount)}</span></div>)}
        {transactions.length === 0 && <p className="py-8 text-center text-sm text-gray-400">لا توجد عمليات بعد.</p>}
      </div>
    </div>
  );
}
