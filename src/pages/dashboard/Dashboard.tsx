import { DollarSign, Receipt, TrendingUp, Wallet } from "lucide-react";
import AIInsightCard from "../../components/dashboard/AIInsightCard";
import CashFlow from "../../components/dashboard/CashFlow";
import MetricCard from "../../components/dashboard/MetricCard";
import RevenueChart from "../../components/dashboard/RevenueChart";
import TopProducts from "../../components/dashboard/TopProducts";
import Transactions from "../../components/dashboard/Transactions";
import { useErp } from "../../context/ErpContext";
import { formatCurrency } from "../../lib/format";

export default function Dashboard() {
  const { invoices, expenses } = useErp();
  const paidRevenue = invoices.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.total, 0);
  const totalExpenses = expenses.filter((expense) => expense.status === "paid").reduce((sum, expense) => sum + expense.amount, 0);
  const costOfGoods = invoices.filter((invoice) => invoice.status === "paid").flatMap((invoice) => invoice.items).reduce((sum, item) => sum + item.unitCost * item.quantity, 0);
  const netProfit = paidRevenue - totalExpenses - costOfGoods;
  const outstanding = invoices.filter((invoice) => invoice.status !== "paid").reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1><p className="mt-2 text-gray-500">ملخص مباشر للبيانات التجريبية الخاصة بشركتك</p></div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="الإيرادات المحصلة" value={formatCurrency(paidRevenue)} change={`${invoices.filter((invoice) => invoice.status === "paid").length} فواتير`} icon={<TrendingUp />} />
        <MetricCard title="المصروفات" value={formatCurrency(totalExpenses)} change={`${expenses.length} قيود`} positive={false} icon={<Receipt />} />
        <MetricCard title="صافي الربح التقديري" value={formatCurrency(netProfit)} change="بعد التكلفة والمصروفات" positive={netProfit >= 0} icon={<DollarSign />} />
        <MetricCard title="مبالغ مستحقة" value={formatCurrency(outstanding)} change="بانتظار التحصيل" positive={outstanding === 0} icon={<Wallet />} />
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3"><div className="min-w-0 xl:col-span-2"><RevenueChart /></div><AIInsightCard /></div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2"><Transactions /><CashFlow /></div>
      <TopProducts />
    </div>
  );
}
