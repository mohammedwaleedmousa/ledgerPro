import { ArrowRight, CircleDollarSign, Download, FileText, HandCoins, Pencil, RotateCcw, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Table from "../../components/common/Table";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatDate, formatNumber } from "../../lib/format";
import { appPaths } from "../../routes/navigation";

const invoiceStatusLabels = { draft: "مسودة", sent: "مرسلة", paid: "مدفوعة", overdue: "متأخرة" } as const;

export default function CustomerDetails() {
  const { customerId } = useParams();
  const { customers, invoices, payments, salesReturns } = useErp();
  const customer = customers.find((item) => item.id === customerId);

  if (!customer) {
    return <div className="space-y-4"><PageHeader title="العميل غير موجود" description="قد يكون السجل حُذف أو أن الرابط غير صحيح." eyebrow="جهات التعامل" /><Card className="py-12 text-center"><Link to={appPaths.customers} className="text-xs font-bold text-blue-600">العودة إلى العملاء</Link></Card></div>;
  }

  const customerInvoices = invoices.filter((invoice) => invoice.customerId === customer.id);
  const customerPayments = payments.filter((payment) => payment.partyType === "customer" && payment.partyId === customer.id);
  const customerReturns = salesReturns.filter((item) => item.customerId === customer.id);
  const totalSales = customerInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalReceipts = customerPayments.filter((payment) => payment.direction === "receipt").reduce((sum, payment) => sum + payment.amount, 0);
  const totalReturns = customerReturns.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="customer-statement space-y-4">
      <PageHeader title={customer.name} description="ملف العميل وكشف الفواتير والتحصيلات والمرتجعات." eyebrow="كشف حساب العميل" actions={<><Link to={appPaths.customers} className="inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700"><ArrowRight size={14} />العملاء</Link><Link to={appPaths.editCustomer(customer.id)} className="inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-xs font-bold text-blue-700"><Pencil size={14} />تعديل</Link><Button onClick={() => window.print()}><Download size={14} />طباعة الكشف</Button></>} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard title="إجمالي المبيعات" value={formatCurrency(totalSales)} icon={FileText} /><StatCard title="إجمالي المقبوضات" value={formatCurrency(totalReceipts)} icon={HandCoins} tone="emerald" /><StatCard title="المرتجعات" value={formatCurrency(totalReturns)} icon={RotateCcw} tone="amber" /><StatCard title="الرصيد الحالي" value={formatCurrency(customer.balance)} icon={CircleDollarSign} tone={customer.balance > 0 ? "rose" : "emerald"} /></div>

      <Card><div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><UserRound size={18} /></span><div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><div><p className="text-[9px] text-slate-400">البريد الإلكتروني</p><p className="mt-1 break-all text-[11px] font-bold text-slate-700">{customer.email || "—"}</p></div><div><p className="text-[9px] text-slate-400">الهاتف</p><p className="mt-1 text-[11px] font-bold text-slate-700">{customer.phone || "—"}</p></div><div><p className="text-[9px] text-slate-400">الرقم الضريبي</p><p className="mt-1 text-[11px] font-bold text-slate-700">{customer.taxNumber || "—"}</p></div><div><p className="text-[9px] text-slate-400">العنوان</p><p className="mt-1 text-[11px] font-bold text-slate-700">{customer.address || "—"}</p></div></div></div></Card>

      <section><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-slate-900">الفواتير</h2><span className="text-[9px] text-slate-400">{formatNumber(customerInvoices.length)} سجلات</span></div><Table minWidth="700px"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">الرقم</th><th className="p-4">التاريخ</th><th className="p-4">العناصر</th><th className="p-4">الإجمالي</th><th className="p-4">الحالة</th><th className="p-4">العرض</th></tr></thead><tbody>{customerInvoices.map((invoice) => <tr key={invoice.id} className="border-b border-slate-100 last:border-0"><td className="p-4 font-mono text-[10px] font-bold text-blue-700">{invoice.number}</td><td className="p-4 text-[10px] text-slate-500">{formatDate(invoice.issueDate)}</td><td className="p-4 text-[10px] text-slate-500">{formatNumber(invoice.items.reduce((sum, item) => sum + item.quantity, 0))}</td><td className="p-4 text-xs font-extrabold">{formatCurrency(invoice.total)}</td><td className="p-4"><Badge variant={invoice.status === "paid" ? "success" : invoice.status === "overdue" ? "danger" : "info"}>{invoiceStatusLabels[invoice.status]}</Badge></td><td className="p-4"><Link to={appPaths.invoiceDetails(invoice.id)} className="text-[10px] font-bold text-blue-600">فتح</Link></td></tr>)}{customerInvoices.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-xs text-slate-400">لا توجد فواتير لهذا العميل.</td></tr>}</tbody></Table></section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-slate-900">المقبوضات</h2><span className="text-[9px] text-slate-400">{formatNumber(customerPayments.length)} سجلات</span></div><Table minWidth="520px"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">السند</th><th className="p-4">التاريخ</th><th className="p-4">المرجع</th><th className="p-4">المبلغ</th></tr></thead><tbody>{customerPayments.map((payment) => <tr key={payment.id} className="border-b border-slate-100 last:border-0"><td className="p-4 font-mono text-[10px] font-bold text-blue-700">{payment.number}</td><td className="p-4 text-[10px] text-slate-500">{formatDate(payment.date)}</td><td className="p-4 text-[10px] text-slate-500">{payment.reference || "—"}</td><td className="p-4 text-xs font-extrabold text-emerald-600">{formatCurrency(payment.amount)}</td></tr>)}{customerPayments.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-xs text-slate-400">لا توجد سندات للعميل.</td></tr>}</tbody></Table></section>
        <section><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-slate-900">المرتجعات</h2><span className="text-[9px] text-slate-400">{formatNumber(customerReturns.length)} سجلات</span></div><Table minWidth="520px"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">الرقم</th><th className="p-4">الفاتورة</th><th className="p-4">التاريخ</th><th className="p-4">المبلغ</th></tr></thead><tbody>{customerReturns.map((item) => <tr key={item.id} className="border-b border-slate-100 last:border-0"><td className="p-4 font-mono text-[10px] font-bold text-blue-700">{item.number}</td><td className="p-4 text-[10px] text-slate-500">{item.invoiceNumber}</td><td className="p-4 text-[10px] text-slate-500">{formatDate(item.date)}</td><td className="p-4 text-xs font-extrabold text-rose-600">{formatCurrency(item.amount)}</td></tr>)}{customerReturns.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-xs text-slate-400">لا توجد مرتجعات للعميل.</td></tr>}</tbody></Table></section>
      </div>
    </div>
  );
}
