import { ArrowDownLeft, ArrowUpRight, Banknote, Plus, ReceiptText, Search, WalletCards, X } from "lucide-react";
import { useState } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Table from "../../components/common/Table";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatDate, formatNumber } from "../../lib/format";
import type { PaymentDirection, PaymentMethod } from "../../types/erp";

const methodLabels: Record<PaymentMethod, string> = { cash: "نقدي", bank: "تحويل بنكي", card: "بطاقة", credit: "آجل" };

export default function Payments() {
  const { payments, customers, suppliers, createPayment } = useErp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState<PaymentDirection>("receipt");
  const [partyId, setPartyId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const parties = direction === "receipt" ? customers : suppliers;
  const receipts = payments.filter((payment) => payment.direction === "receipt").reduce((sum, payment) => sum + payment.amount, 0);
  const disbursements = payments.filter((payment) => payment.direction === "payment").reduce((sum, payment) => sum + payment.amount, 0);
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = payments.filter((payment) => !normalizedSearch || payment.number.toLowerCase().includes(normalizedSearch) || payment.partyName.toLowerCase().includes(normalizedSearch) || payment.reference.toLowerCase().includes(normalizedSearch));

  function changeDirection(value: PaymentDirection) {
    setDirection(value);
    setPartyId("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const payment = createPayment({ direction, partyType: direction === "receipt" ? "customer" : "supplier", partyId, date, method, amount: Number(amount), reference, notes });
      setPartyId(""); setAmount(""); setReference(""); setNotes(""); setError(null); setMessage(`تم تسجيل ${direction === "receipt" ? "سند القبض" : "سند الصرف"} ${payment.number}.`); setShowForm(false);
    } catch (saveError) {
      setMessage(null);
      setError(saveError instanceof Error ? saveError.message : "تعذر تسجيل السند.");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="القبض والصرف" description="سجل تحصيلات العملاء ومدفوعات الموردين وتابع حركة النقد." eyebrow="المالية" actions={<Button onClick={() => setShowForm((current) => !current)}>{showForm ? <X size={15} /> : <Plus size={15} />}{showForm ? "إغلاق النموذج" : "سند جديد"}</Button>} />
      {message && <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[11px] font-bold text-emerald-700">{message}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="إجمالي المقبوضات" value={formatCurrency(receipts)} icon={ArrowDownLeft} tone="emerald" />
        <StatCard title="إجمالي المدفوعات" value={formatCurrency(disbursements)} icon={ArrowUpRight} tone="rose" />
        <StatCard title="صافي الحركة" value={formatCurrency(receipts - disbursements)} icon={WalletCards} tone={receipts >= disbursements ? "blue" : "rose"} />
        <StatCard title="عدد السندات" value={formatNumber(payments.length)} icon={ReceiptText} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <Card>
            <div><h2 className="text-sm font-extrabold text-slate-900">بيانات السند</h2><p className="mt-1 text-[10px] text-slate-400">اختيار النوع يحدد جهة الرصيد التي سيتم تحديثها.</p></div>
            {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-[11px] font-medium text-rose-700">{error}</div>}
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1.5"><label htmlFor="payment-direction" className="block text-[11px] font-bold text-slate-600">نوع السند</label><select id="payment-direction" value={direction} onChange={(event) => changeDirection(event.target.value as PaymentDirection)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none"><option value="receipt">سند قبض من عميل</option><option value="payment">سند صرف لمورد</option></select></div>
              <div className="space-y-1.5"><label htmlFor="payment-party" className="block text-[11px] font-bold text-slate-600">{direction === "receipt" ? "العميل" : "المورد"}</label><select id="payment-party" value={partyId} onChange={(event) => setPartyId(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none" required><option value="">اختر الجهة</option>{parties.map((party) => <option key={party.id} value={party.id}>{party.name}</option>)}</select></div>
              <Input label="التاريخ" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
              <Input label="المبلغ" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required />
              <div className="space-y-1.5"><label htmlFor="payment-method" className="block text-[11px] font-bold text-slate-600">طريقة الدفع</label><select id="payment-method" value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none">{Object.entries(methodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              <Input label="المرجع" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="رقم فاتورة أو مرجع بنكي" />
              <div className="space-y-1.5 md:col-span-2"><label htmlFor="payment-notes" className="block text-[11px] font-bold text-slate-600">ملاحظات</label><textarea id="payment-notes" value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 px-3 py-2.5 text-xs outline-none" /></div>
            </div>
            <Button type="submit" className="mt-5"><Banknote size={15} />حفظ السند</Button>
          </Card>
        </form>
      )}

      <Card className="p-3 sm:p-4"><label className="flex h-10 max-w-md items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3"><Search size={15} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="الرقم أو الجهة أو المرجع..." className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label></Card>

      <Table minWidth="850px">
        <thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">الرقم</th><th className="p-4">النوع</th><th className="p-4">الجهة</th><th className="p-4">التاريخ</th><th className="p-4">الطريقة</th><th className="p-4">المرجع</th><th className="p-4">المبلغ</th></tr></thead>
        <tbody>{filtered.map((payment) => <tr key={payment.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"><td className="p-4 font-mono text-[11px] font-bold text-blue-700">{payment.number}</td><td className="p-4"><Badge variant={payment.direction === "receipt" ? "success" : "danger"}>{payment.direction === "receipt" ? "قبض" : "صرف"}</Badge></td><td className="p-4 text-xs font-bold text-slate-700">{payment.partyName}</td><td className="p-4 text-[10px] text-slate-500">{formatDate(payment.date)}</td><td className="p-4 text-[10px] text-slate-500">{methodLabels[payment.method]}</td><td className="p-4 text-[10px] text-slate-500">{payment.reference || "—"}</td><td className={`p-4 text-xs font-extrabold ${payment.direction === "receipt" ? "text-emerald-600" : "text-rose-600"}`}>{payment.direction === "receipt" ? "+" : "-"}{formatCurrency(payment.amount)}</td></tr>)}{filtered.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-xs text-slate-400">لا توجد سندات مطابقة.</td></tr>}</tbody>
      </Table>
    </div>
  );
}
