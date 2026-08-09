import { useErp } from "../../context/ErpContext";
import { formatCurrency } from "../../lib/format";

export default function CashFlow() {
  const { invoices, expenses } = useErp();
  const revenue = invoices.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.total, 0);
  const paidExpenses = expenses.filter((expense) => expense.status === "paid").reduce((sum, expense) => sum + expense.amount, 0);
  const cashFlow = revenue - paidExpenses;
  const maxValue = Math.max(revenue, paidExpenses, 1);

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-gray-900">التدفق النقدي</h3><span className={`text-sm font-medium ${cashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>{cashFlow >= 0 ? "موجب" : "سالب"}</span></div>
      <div className="mt-6"><p className="text-4xl font-bold text-gray-900">{formatCurrency(cashFlow)}</p><p className="mt-2 text-sm text-gray-400">الإيرادات المدفوعة ناقص المصروفات المدفوعة</p></div>
      <div className="mt-8 grid h-32 grid-cols-2 items-end gap-6 rounded-2xl bg-blue-50 p-5">
        <div className="flex h-full flex-col justify-end gap-2"><span className="mx-auto w-10 rounded-t-lg bg-blue-600" style={{ height: `${Math.max(12, (revenue / maxValue) * 76)}px` }} /><span className="text-center text-xs text-gray-500">إيرادات</span></div>
        <div className="flex h-full flex-col justify-end gap-2"><span className="mx-auto w-10 rounded-t-lg bg-indigo-300" style={{ height: `${Math.max(12, (paidExpenses / maxValue) * 76)}px` }} /><span className="text-center text-xs text-gray-500">مصروفات</span></div>
      </div>
    </div>
  );
}
