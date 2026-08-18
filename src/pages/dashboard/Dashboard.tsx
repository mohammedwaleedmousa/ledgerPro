import { CalendarDays, Download, FilePlus2, Package, ReceiptText, TrendingUp, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import ActivityOverview from "../../components/dashboard/ActivityOverview";
import AIInsightCard from "../../components/dashboard/AIInsightCard";
import CashFlow from "../../components/dashboard/CashFlow";
import MetricCard from "../../components/dashboard/MetricCard";
import RevenueChart from "../../components/dashboard/RevenueChart";
import TopProducts from "../../components/dashboard/TopProducts";
import Transactions from "../../components/dashboard/Transactions";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";
import { appPaths } from "../../routes/navigation";

export default function Dashboard() {
  const { invoices, expenses, products, customers } = useErp();
  const paidRevenue = invoices.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.total, 0);
  const totalExpenses = expenses.filter((expense) => expense.status === "paid").reduce((sum, expense) => sum + expense.amount, 0);
  const costOfGoods = invoices.filter((invoice) => invoice.status === "paid").flatMap((invoice) => invoice.items).reduce((sum, item) => sum + item.unitCost * item.quantity, 0);
  const netProfit = paidRevenue - totalExpenses - costOfGoods;
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid").length;
  const lowStock = products.filter((product) => product.stock <= product.lowStockThreshold).length;
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - 30);
  const dateFormatter = new Intl.DateTimeFormat("ar", { day: "numeric", month: "short" });

  function exportSummary() {
    const rows = [
      ["المؤشر", "القيمة"],
      ["الإيرادات المحصلة", paidRevenue],
      ["صافي الربح", netProfit],
      ["عدد الفواتير", invoices.length],
      ["عدد العملاء", customers.length],
      ["عدد المنتجات", products.length],
      ["منتجات منخفضة المخزون", lowStock],
    ];
    const csv = `\uFEFF${rows.map((row) => row.join(",")).join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ledgerpro-dashboard-${now.toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div><h1 className="text-[24px] font-black tracking-tight text-slate-950">لوحة التحكم</h1><p className="mt-1 text-[11px] text-slate-500">نظرة مباشرة على أداء شركتك وعملياتها اليومية.</p></div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-600"><CalendarDays size={14} className="text-slate-400" /><span>{dateFormatter.format(from)} - {dateFormatter.format(now)}</span></div>
          <Link to={appPaths.createInvoice} className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"><FilePlus2 size={14} />فاتورة جديدة</Link>
          <button type="button" onClick={exportSummary} className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-blue-600 px-4 text-[10px] font-bold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"><Download size={14} />تصدير</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="الإيرادات المحصلة" value={formatCurrency(paidRevenue)} change={`${paidInvoices} مدفوعة`} hint="من إجمالي الفواتير" icon={<TrendingUp />} />
        <MetricCard title="العملاء" value={formatNumber(customers.length)} change={`${customers.filter((customer) => customer.status === "active").length} نشط`} hint="قاعدة العملاء" icon={<UsersRound />} />
        <MetricCard title="المنتجات" value={formatNumber(products.length)} change={lowStock ? `${lowStock} منخفض` : "المخزون جيد"} positive={lowStock === 0} hint="حالة المخزون" icon={<Package />} />
        <MetricCard title="الفواتير" value={formatNumber(invoices.length)} change={`${paidInvoices} مكتملة`} hint="كل حالات الفواتير" icon={<ReceiptText />} />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.72fr)]">
        <RevenueChart />
        <ActivityOverview />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.72fr)]">
        <TopProducts />
        <AIInsightCard />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2"><Transactions /><CashFlow /></div>
    </div>
  );
}
