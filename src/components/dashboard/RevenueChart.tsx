import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useErp } from "../../context/ErpContext";
import { formatCurrency } from "../../lib/format";

export default function RevenueChart() {
  const { invoices, expenses } = useErp();
  const formatter = new Intl.DateTimeFormat("ar", { month: "short" });
  const now = new Date();
  const data = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const monthInvoices = invoices
      .filter((invoice) => {
        const invoiceDate = new Date(invoice.issueDate);
        return invoice.status === "paid" && invoiceDate.getFullYear() === date.getFullYear() && invoiceDate.getMonth() === date.getMonth();
      });
    const revenue = monthInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const cost = monthInvoices.flatMap((invoice) => invoice.items).reduce((sum, item) => sum + item.unitCost * item.quantity, 0);
    const monthExpenses = expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expense.status === "paid" && expenseDate.getFullYear() === date.getFullYear() && expenseDate.getMonth() === date.getMonth();
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    return { name: formatter.format(date), profit: revenue - cost - monthExpenses };
  });
  const paidRevenue = invoices.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.total, 0);
  const costOfGoods = invoices.filter((invoice) => invoice.status === "paid").flatMap((invoice) => invoice.items).reduce((sum, item) => sum + item.unitCost * item.quantity, 0);
  const paidExpenses = expenses.filter((expense) => expense.status === "paid").reduce((sum, expense) => sum + expense.amount, 0);
  const outstanding = invoices.filter((invoice) => invoice.status !== "paid").reduce((sum, invoice) => sum + invoice.total, 0);
  const profit = paidRevenue - costOfGoods - paidExpenses;
  const mix = [
    { label: "إيرادات محصلة", value: paidRevenue, color: "bg-blue-500", text: "text-blue-600" },
    { label: "مبالغ مستحقة", value: outstanding, color: "bg-emerald-500", text: "text-emerald-600" },
    { label: "مصروفات مدفوعة", value: paidExpenses, color: "bg-orange-400", text: "text-orange-500" },
  ];
  const mixMaximum = Math.max(...mix.map((item) => item.value), 1);

  return (
    <article className="min-w-0 overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-700">إجمالي الأرباح</p>
          <div className="mt-4 flex flex-wrap items-end gap-2.5">
            <h3 className="text-3xl font-black tracking-tight text-slate-950 tabular-nums sm:text-[34px]">{formatCurrency(profit)}</h3>
            <span className={`mb-1 rounded-full px-2 py-1 text-[10px] font-bold ${profit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{profit >= 0 ? "ربح تشغيلي" : "خسارة تشغيلية"}</span>
          </div>
        </div>
        <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">آخر 6 أشهر</span>
      </div>

      <div className="mt-4 h-[205px] min-w-0" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 6, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="ledger-profit-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e9edf3" strokeDasharray="4 5" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} dy={7} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 9 }} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}K`} />
            <Tooltip formatter={(value) => [formatCurrency(Number(value)), "صافي الربح"]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 24px rgba(15,23,42,.08)", fontSize: 11 }} />
            <Area type="monotone" dataKey="profit" stroke="#2563eb" strokeWidth={2.2} fill="url(#ledger-profit-fill)" activeDot={{ r: 4, fill: "#2563eb", stroke: "white", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/80">
        <div className="flex items-center justify-between px-3.5 py-2.5"><p className="text-[11px] font-bold text-slate-700">ملخص الحركة المالية</p><span className="text-[9px] text-slate-400">بيانات مباشرة</span></div>
        <div className="grid grid-cols-1 border-t border-slate-100 sm:grid-cols-3">
          {mix.map((item, index) => (
            <div key={item.label} className={`relative min-w-0 px-3.5 py-3 ${index > 0 ? "border-t border-slate-100 sm:border-r sm:border-t-0" : ""}`}>
              <p className="truncate text-[9px] text-slate-400">{item.label}</p>
              <p className={`mt-1 truncate text-sm font-extrabold tabular-nums ${item.text}`}>{formatCurrency(item.value)}</p>
              <span className="absolute bottom-0 right-0 h-0.5 rounded-full bg-slate-100" style={{ width: "100%" }}><span className={`block h-full rounded-full ${item.color}`} style={{ width: `${Math.max(6, (item.value / mixMaximum) * 100)}%` }} /></span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
