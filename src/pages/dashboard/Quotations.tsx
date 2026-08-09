import { BadgeDollarSign, CheckCircle2, Clock3, FilePlus2, Files, ReceiptText, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Table from "../../components/common/Table";
import LineItemsEditor, { type DocumentLineInput } from "../../components/documents/LineItemsEditor";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatDate, formatNumber } from "../../lib/format";
import type { QuotationStatus } from "../../types/erp";
import { appPaths } from "../../routes/navigation";

const statusLabels: Record<QuotationStatus, string> = { draft: "مسودة", sent: "مرسل", accepted: "مقبول", expired: "منتهي", rejected: "مرفوض" };
const statusStyles: Record<QuotationStatus, string> = { draft: "bg-slate-100 text-slate-600", sent: "bg-blue-50 text-blue-700", accepted: "bg-emerald-50 text-emerald-700", expired: "bg-amber-50 text-amber-700", rejected: "bg-rose-50 text-rose-700" };

function futureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function Quotations() {
  const { quotations, customers, products, settings, createQuotation, updateQuotationStatus, convertQuotationToInvoice } = useErp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState(() => futureDate(0));
  const [expiryDate, setExpiryDate] = useState(() => futureDate(14));
  const [status, setStatus] = useState<QuotationStatus>("draft");
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DocumentLineInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitAmount, 0), [items]);
  const total = subtotal * (1 + Math.max(0, taxRate) / 100);
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = quotations.filter((quotation) => !normalizedSearch || quotation.number.toLowerCase().includes(normalizedSearch) || quotation.customerName.toLowerCase().includes(normalizedSearch));

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const quotation = createQuotation({ customerId, issueDate, expiryDate, status, taxRate, notes, items: items.map((item) => ({ productId: item.productId, quantity: item.quantity, unitPrice: item.unitAmount })) });
      setCustomerId(""); setItems([]); setNotes(""); setError(null); setMessage(`تم إنشاء العرض ${quotation.number}.`); setShowForm(false);
    } catch (saveError) {
      setMessage(null);
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ عرض السعر.");
    }
  }

  function handleConvert(id: string) {
    try {
      const invoice = convertQuotationToInvoice(id);
      setError(null);
      setMessage(`تم تحويل العرض إلى الفاتورة ${invoice.number} وتحديث المخزون والرصيد.`);
    } catch (conversionError) {
      setMessage(null);
      setError(conversionError instanceof Error ? conversionError.message : "تعذر تحويل عرض السعر.");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="عروض الأسعار" description="أنشئ عروضًا احترافية وتابع قبولها قبل تحويلها إلى عملية بيع." eyebrow="المبيعات" actions={<Button onClick={() => setShowForm((current) => !current)}>{showForm ? <X size={15} /> : <FilePlus2 size={15} />}{showForm ? "إغلاق النموذج" : "عرض سعر جديد"}</Button>} />
      {message && <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[11px] font-bold text-emerald-700">{message}</div>}
      {error && !showForm && <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-[11px] font-bold text-rose-700">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="إجمالي العروض" value={formatNumber(quotations.length)} icon={Files} meta="كل الحالات" />
        <StatCard title="العروض المقبولة" value={formatNumber(quotations.filter((item) => item.status === "accepted").length)} icon={CheckCircle2} tone="emerald" meta="جاهزة للتحويل" />
        <StatCard title="بانتظار الرد" value={formatNumber(quotations.filter((item) => item.status === "sent").length)} icon={Clock3} tone="amber" meta="عروض مرسلة" />
        <StatCard title="قيمة العروض" value={formatCurrency(quotations.reduce((sum, item) => sum + item.total, 0))} icon={BadgeDollarSign} meta="إجمالي القيمة" />
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="space-y-4">
          <Card>
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-extrabold text-slate-900">بيانات العرض</h2><p className="mt-1 text-[10px] text-slate-400">حدد العميل والصلاحية والحالة.</p></div></div>
            {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-[11px] font-medium text-rose-700">{error}</div>}
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1.5"><label htmlFor="quotation-customer" className="block text-[11px] font-bold text-slate-600">العميل</label><select id="quotation-customer" value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500" required><option value="">اختر العميل</option>{customers.filter((customer) => customer.status === "active").map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></div>
              <Input label="تاريخ الإصدار" type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} required />
              <Input label="صالح حتى" type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} required />
              <div className="space-y-1.5"><label htmlFor="quotation-status" className="block text-[11px] font-bold text-slate-600">الحالة</label><select id="quotation-status" value={status} onChange={(event) => setStatus(event.target.value as QuotationStatus)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500"><option value="draft">مسودة</option><option value="sent">مرسل</option></select></div>
              <Input label="الضريبة %" type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(event) => setTaxRate(Number(event.target.value))} />
              <div className="space-y-1.5 md:col-span-2 xl:col-span-3"><label htmlFor="quotation-notes" className="block text-[11px] font-bold text-slate-600">ملاحظات</label><textarea id="quotation-notes" value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500" /></div>
            </div>
          </Card>
          <LineItemsEditor products={products} items={items} mode="sale" onChange={setItems} />
          <Card className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-[10px] text-slate-400">الإجمالي شامل الضريبة</p><p className="mt-1 text-2xl font-black text-slate-950">{formatCurrency(total)}</p></div><Button type="submit"><FilePlus2 size={15} />حفظ عرض السعر</Button></Card>
        </form>
      )}

      <Card className="p-3 sm:p-4">
        <label className="flex h-10 max-w-md items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3"><Search size={15} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالرقم أو العميل..." className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label>
      </Card>

      <Table minWidth="940px">
        <thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">الرقم</th><th className="p-4">العميل</th><th className="p-4">الإصدار</th><th className="p-4">الصلاحية</th><th className="p-4">الإجمالي</th><th className="p-4">الحالة</th><th className="p-4">التحويل</th></tr></thead>
        <tbody>{filtered.map((quotation) => <tr key={quotation.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"><td className="p-4 font-mono text-[11px] font-bold text-blue-700">{quotation.number}</td><td className="p-4 text-xs font-bold text-slate-700">{quotation.customerName}</td><td className="p-4 text-[10px] text-slate-500">{formatDate(quotation.issueDate)}</td><td className="p-4 text-[10px] text-slate-500">{formatDate(quotation.expiryDate)}</td><td className="p-4 text-xs font-extrabold text-slate-900">{formatCurrency(quotation.total)}</td><td className="p-4"><select disabled={Boolean(quotation.convertedInvoiceId)} value={quotation.status} onChange={(event) => updateQuotationStatus(quotation.id, event.target.value as QuotationStatus)} className={`rounded-full border-0 px-2.5 py-1.5 text-[9px] font-bold outline-none disabled:cursor-not-allowed ${statusStyles[quotation.status]}`}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td><td className="p-4">{quotation.convertedInvoiceId ? <Link to={appPaths.invoiceDetails(quotation.convertedInvoiceId)} className="text-[10px] font-bold text-blue-600">{quotation.convertedInvoiceNumber}</Link> : quotation.status === "accepted" ? <Button size="sm" variant="secondary" onClick={() => handleConvert(quotation.id)}><ReceiptText size={13} />تحويل</Button> : <span className="text-[9px] text-slate-400">اعتمد العرض أولاً</span>}</td></tr>)}{filtered.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-xs text-slate-400">لا توجد عروض مطابقة.</td></tr>}</tbody>
      </Table>
    </div>
  );
}
