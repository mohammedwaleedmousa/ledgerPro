import { ArrowRight, Building2, Download, Printer } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import PageHeader from "../../components/common/PageHeader";
import { useCompany } from "../../context/CompanyContext";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatDate } from "../../lib/format";
import { appPaths } from "../../routes/navigation";
import type { InvoiceStatus, PaymentMethod } from "../../types/erp";

const statusLabels: Record<InvoiceStatus, string> = { draft: "مسودة", sent: "مرسلة", paid: "مدفوعة", overdue: "متأخرة" };
const methodLabels: Record<PaymentMethod, string> = { cash: "نقدي", bank: "تحويل بنكي", card: "بطاقة", credit: "آجل" };

export default function InvoiceDetails() {
  const { invoiceId } = useParams();
  const { invoices } = useErp();
  const { company } = useCompany();
  const invoice = invoices.find((item) => item.id === invoiceId);

  if (!invoice) {
    return <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-[18px] border border-slate-200 bg-white p-8 text-center"><p className="text-lg font-black text-slate-900">الفاتورة غير موجودة</p><p className="mt-2 text-xs text-slate-500">ربما تم حذفها أو أن الرابط غير صحيح.</p><Link to={appPaths.invoices} className="mt-5 rounded-[10px] bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">العودة إلى الفواتير</Link></div>;
  }

  return (
    <div className="space-y-4">
      <div className="print:hidden"><PageHeader title={`الفاتورة ${invoice.number}`} description="معاينة تفاصيل الفاتورة وتجهيزها للطباعة أو الحفظ PDF." eyebrow="المبيعات" actions={<><Link to={appPaths.invoices} className="inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700"><ArrowRight size={14} />رجوع</Link><Button variant="secondary" onClick={() => window.print()}><Printer size={15} />طباعة / PDF</Button><Button onClick={() => window.print()}><Download size={15} />تنزيل</Button></>} /></div>

      <article className="invoice-print mx-auto max-w-5xl overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
        <div className="border-b border-slate-100 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white"><Building2 size={20} /></span><div><h1 className="text-xl font-black text-slate-950">{company?.name ?? "LedgerPro"}</h1><p className="mt-1 text-[10px] text-slate-400">فاتورة مبيعات</p></div></div>
            <div className="text-right sm:text-left"><p className="font-mono text-xl font-black text-blue-700">{invoice.number}</p><div className="mt-2"><Badge variant={invoice.status === "paid" ? "success" : invoice.status === "overdue" ? "danger" : invoice.status === "sent" ? "info" : "neutral"}>{statusLabels[invoice.status]}</Badge></div></div>
          </div>

          <div className="mt-8 grid gap-5 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
            <div><p className="text-[9px] font-bold text-slate-400">العميل</p><p className="mt-1.5 text-xs font-extrabold text-slate-800">{invoice.customerName}</p></div>
            <div><p className="text-[9px] font-bold text-slate-400">تاريخ الإصدار</p><p className="mt-1.5 text-xs font-extrabold text-slate-800">{formatDate(invoice.issueDate)}</p></div>
            <div><p className="text-[9px] font-bold text-slate-400">طريقة الدفع</p><p className="mt-1.5 text-xs font-extrabold text-slate-800">{methodLabels[invoice.paymentMethod]}</p></div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="max-w-full overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[620px] text-right">
              <thead><tr className="bg-slate-50 text-[9px] text-slate-400"><th className="p-3.5">المنتج</th><th className="p-3.5">الكمية</th><th className="p-3.5">سعر الوحدة</th><th className="p-3.5">الإجمالي</th></tr></thead>
              <tbody>{invoice.items.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="p-3.5 text-xs font-bold text-slate-800">{item.productName}</td><td className="p-3.5 text-[11px] text-slate-600">{item.quantity}</td><td className="p-3.5 text-[11px] text-slate-600">{formatCurrency(item.unitPrice)}</td><td className="p-3.5 text-xs font-extrabold text-slate-900">{formatCurrency(item.total)}</td></tr>)}</tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end"><div className="w-full max-w-sm space-y-3 rounded-xl bg-slate-50 p-4"><div className="flex justify-between text-[11px] text-slate-500"><span>الإجمالي الفرعي</span><span className="font-bold text-slate-700">{formatCurrency(invoice.subtotal)}</span></div><div className="flex justify-between text-[11px] text-slate-500"><span>الضريبة ({invoice.taxRate}%)</span><span className="font-bold text-slate-700">{formatCurrency(invoice.taxAmount)}</span></div><div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-black text-slate-950"><span>الإجمالي</span><span>{formatCurrency(invoice.total)}</span></div></div></div>

          {invoice.notes && <div className="mt-6 rounded-xl border border-slate-200 p-4"><p className="text-[9px] font-bold text-slate-400">ملاحظات</p><p className="mt-2 text-[11px] leading-6 text-slate-600">{invoice.notes}</p></div>}
          <p className="mt-8 text-center text-[9px] text-slate-400">شكرًا لتعاملكم معنا · تم إنشاء الفاتورة بواسطة LedgerPro</p>
        </div>
      </article>
    </div>
  );
}
