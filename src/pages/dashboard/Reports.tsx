import { BadgeDollarSign, BanknoteArrowDown, Boxes, Download, Scale, TrendingUp, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Table from "../../components/common/Table";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";

type Period = "month" | "quarter" | "year" | "all";

const periodLabels: Record<Period, string> = {
  month: "هذا الشهر",
  quarter: "آخر 3 أشهر",
  year: "هذه السنة",
  all: "كل الفترات",
};

function periodStart(period: Period) {
  const now = new Date();
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === "quarter") return new Date(now.getFullYear(), now.getMonth() - 2, 1);
  if (period === "year") return new Date(now.getFullYear(), 0, 1);
  return null;
}

function isInPeriod(value: string, start: Date | null) {
  if (!start) return true;
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date >= start;
}

export default function Reports() {
  const { invoices, expenses, payments, salesReturns, accounts, products, customers } = useErp();
  const [period, setPeriod] = useState<Period>("month");
  const report = useMemo(() => {
    const start = periodStart(period);
    const periodInvoices = invoices.filter((invoice) => invoice.status !== "draft" && isInPeriod(invoice.issueDate, start));
    const periodReturns = salesReturns.filter((item) => isInPeriod(item.date, start));
    const returnedInvoiceIds = new Set(periodReturns.map((item) => item.invoiceId));
    const grossSales = periodInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const returns = periodReturns.reduce((sum, item) => sum + item.amount, 0);
    const netRevenue = grossSales - returns;
    const cogs = periodInvoices.reduce((sum, invoice) => sum + (returnedInvoiceIds.has(invoice.id) ? 0 : invoice.items.reduce((itemSum, item) => itemSum + item.unitCost * item.quantity, 0)), 0);
    const operatingExpenses = expenses.filter((expense) => expense.status === "paid" && isInPeriod(expense.date, start)).reduce((sum, expense) => sum + expense.amount, 0);
    const grossProfit = netRevenue - cogs;
    const netProfit = grossProfit - operatingExpenses;
    const periodPayments = payments.filter((payment) => isInPeriod(payment.date, start));
    const receipts = periodPayments.filter((payment) => payment.direction === "receipt").reduce((sum, payment) => sum + payment.amount, 0);
    const disbursements = periodPayments.filter((payment) => payment.direction === "payment").reduce((sum, payment) => sum + payment.amount, 0);
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    periodInvoices.filter((invoice) => !returnedInvoiceIds.has(invoice.id)).forEach((invoice) => invoice.items.forEach((item) => {
      const current = productSales.get(item.productId) ?? { name: item.productName, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += item.total;
      productSales.set(item.productId, current);
    }));

    return {
      invoiceCount: periodInvoices.length,
      grossSales,
      returns,
      netRevenue,
      cogs,
      operatingExpenses,
      grossProfit,
      netProfit,
      receipts,
      disbursements,
      topProducts: [...productSales.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    };
  }, [expenses, invoices, payments, period, salesReturns]);

  const assets = accounts.filter((account) => account.type === "asset").reduce((sum, account) => sum + account.balance, 0);
  const liabilities = accounts.filter((account) => account.type === "liability").reduce((sum, account) => sum + account.balance, 0);
  const equity = accounts.filter((account) => account.type === "equity").reduce((sum, account) => sum + account.balance, 0);
  const inventoryValue = products.reduce((sum, product) => sum + product.stock * product.cost, 0);
  const receivables = customers.reduce((sum, customer) => sum + customer.balance, 0);

  return (
    <div className="report-print space-y-4">
      <PageHeader
        title="التقارير المالية"
        description="مؤشرات الأرباح والسيولة والمركز المالي محسوبة مباشرة من بيانات النظام الحالية."
        eyebrow="التحليلات"
        actions={<><select aria-label="الفترة" value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="min-h-10 rounded-[10px] border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none">{Object.entries(periodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><Button variant="secondary" onClick={() => window.print()}><Download size={14} />طباعة / PDF</Button></>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="صافي الإيرادات" value={formatCurrency(report.netRevenue)} icon={BadgeDollarSign} meta={`${formatNumber(report.invoiceCount)} فواتير في الفترة`} />
        <StatCard title="مجمل الربح" value={formatCurrency(report.grossProfit)} icon={TrendingUp} tone={report.grossProfit >= 0 ? "emerald" : "rose"} />
        <StatCard title="المصروفات التشغيلية" value={formatCurrency(report.operatingExpenses)} icon={BanknoteArrowDown} tone="amber" />
        <StatCard title="صافي الربح" value={formatCurrency(report.netProfit)} icon={WalletCards} tone={report.netProfit >= 0 ? "blue" : "rose"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between"><div><h2 className="text-sm font-black text-slate-900">قائمة الأرباح والخسائر</h2><p className="mt-1 text-[10px] text-slate-400">{periodLabels[period]}</p></div><TrendingUp size={18} className="text-blue-600" /></div>
          <div className="mt-5 space-y-3 text-[11px]">{[
            ["إجمالي المبيعات", report.grossSales],
            ["مرتجعات المبيعات", -report.returns],
            ["صافي الإيرادات", report.netRevenue],
            ["تكلفة البضاعة", -report.cogs],
            ["مجمل الربح", report.grossProfit],
            ["المصروفات", -report.operatingExpenses],
          ].map(([label, value]) => <div key={String(label)} className="flex justify-between rounded-xl bg-slate-50 px-3.5 py-3"><span className="text-slate-500">{label}</span><strong className={Number(value) < 0 ? "text-rose-600" : "text-slate-800"}>{formatCurrency(Number(value))}</strong></div>)}<div className="flex justify-between border-t border-slate-200 pt-4 text-sm"><span className="font-black text-slate-900">صافي الربح</span><strong className={report.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}>{formatCurrency(report.netProfit)}</strong></div></div>
        </Card>

        <Card>
          <div className="flex items-center justify-between"><div><h2 className="text-sm font-black text-slate-900">التدفق النقدي المسجل</h2><p className="mt-1 text-[10px] text-slate-400">مبني على سندات القبض والصرف</p></div><WalletCards size={18} className="text-emerald-600" /></div>
          <div className="mt-5 space-y-4"><div className="rounded-xl bg-emerald-50 p-4"><p className="text-[10px] font-bold text-emerald-700">المقبوضات</p><p className="mt-2 text-2xl font-black text-emerald-700">{formatCurrency(report.receipts)}</p></div><div className="rounded-xl bg-rose-50 p-4"><p className="text-[10px] font-bold text-rose-700">المدفوعات</p><p className="mt-2 text-2xl font-black text-rose-700">{formatCurrency(report.disbursements)}</p></div><div className="flex justify-between border-t border-slate-200 pt-4 text-sm"><span className="font-black">صافي الحركة</span><strong>{formatCurrency(report.receipts - report.disbursements)}</strong></div></div>
        </Card>

        <Card>
          <div className="flex items-center justify-between"><div><h2 className="text-sm font-black text-slate-900">المركز المالي</h2><p className="mt-1 text-[10px] text-slate-400">أرصدة دليل الحسابات الحالية</p></div><Scale size={18} className="text-amber-600" /></div>
          <div className="mt-5 space-y-3 text-[11px]">{[["الأصول", assets], ["الالتزامات", liabilities], ["حقوق الملكية", equity], ["المخزون التشغيلي", inventoryValue], ["ذمم العملاء", receivables]].map(([label, value]) => <div key={String(label)} className="flex justify-between rounded-xl bg-slate-50 px-3.5 py-3"><span className="text-slate-500">{label}</span><strong className="text-slate-800">{formatCurrency(Number(value))}</strong></div>)}</div>
        </Card>
      </div>

      <section>
        <div className="mb-3 flex items-center gap-2"><Boxes size={16} className="text-blue-600" /><h2 className="text-sm font-black text-slate-900">أفضل المنتجات في الفترة</h2></div>
        <Table minWidth="560px"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">المنتج</th><th className="p-4">الكمية</th><th className="p-4">الإيراد</th><th className="p-4">الحصة</th></tr></thead><tbody>{report.topProducts.map((product) => <tr key={product.name} className="border-b border-slate-100 last:border-0"><td className="p-4 text-xs font-bold text-slate-800">{product.name}</td><td className="p-4 text-xs text-slate-600">{formatNumber(product.quantity)}</td><td className="p-4 text-xs font-extrabold text-emerald-600">{formatCurrency(product.revenue)}</td><td className="p-4 text-[10px] text-slate-500">{report.netRevenue > 0 ? `${Math.round((product.revenue / report.netRevenue) * 100)}%` : "—"}</td></tr>)}{report.topProducts.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-xs text-slate-400">لا توجد مبيعات مرحّلة في هذه الفترة.</td></tr>}</tbody></Table>
      </section>
    </div>
  );
}
