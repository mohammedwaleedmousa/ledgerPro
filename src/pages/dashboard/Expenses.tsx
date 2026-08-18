import { CircleDollarSign, Clock3, Plus, ReceiptText, Search, Trash2 } from "lucide-react";
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

export default function Expenses() {
  const { expenses, suppliers, addExpense, removeExpense } = useErp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending">("all");
  const [category, setCategory] = useState("تشغيل");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<"paid" | "pending">("paid");
  const [supplierId, setSupplierId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const totalPaid = expenses.filter((expense) => expense.status === "paid").reduce((sum, expense) => sum + expense.amount, 0);
  const totalPending = expenses.filter((expense) => expense.status === "pending").reduce((sum, expense) => sum + expense.amount, 0);
  const normalized = search.trim().toLowerCase();
  const filtered = expenses.filter((expense) => (filterStatus === "all" || expense.status === filterStatus) && (!normalized || expense.description.toLowerCase().includes(normalized) || expense.category.toLowerCase().includes(normalized)));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      addExpense({ category, description, amount: Number(amount), date, status, supplierId });
      setDescription(""); setAmount(""); setSupplierId(""); setError(null); setShowForm(false);
    } catch (expenseError) { setError(expenseError instanceof Error ? expenseError.message : "تعذر حفظ المصروف."); }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="المصروفات" description="تسجيل المصروفات التشغيلية ومتابعة المدفوع والمعلّق." eyebrow="المالية" actions={<Button onClick={() => setShowForm((current) => !current)}><Plus size={14} />{showForm ? "إغلاق" : "تسجيل مصروف"}</Button>} />
      <div className="grid gap-3 md:grid-cols-3"><StatCard title="إجمالي المدفوع" value={formatCurrency(totalPaid)} icon={CircleDollarSign} tone="emerald" /><StatCard title="قيد الانتظار" value={formatCurrency(totalPending)} icon={Clock3} tone="amber" /><StatCard title="عدد السجلات" value={formatNumber(expenses.length)} icon={ReceiptText} /></div>

      {showForm && <form onSubmit={handleSubmit}><Card>{error && <div className="mb-4 rounded-xl bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><div className="space-y-1.5"><label htmlFor="expense-category" className="block text-[11px] font-bold text-slate-600">التصنيف</label><select id="expense-category" value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 px-3 text-xs outline-none"><option>تشغيل</option><option>إيجار</option><option>خدمات</option><option>رواتب</option><option>تسويق</option><option>أخرى</option></select></div><Input label="الوصف" value={description} onChange={(event) => setDescription(event.target.value)} required /><Input label="المبلغ" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /><Input label="التاريخ" type="date" value={date} onChange={(event) => setDate(event.target.value)} required /><div className="space-y-1.5"><label htmlFor="expense-status" className="block text-[11px] font-bold text-slate-600">الحالة</label><select id="expense-status" value={status} onChange={(event) => setStatus(event.target.value as "paid" | "pending")} className="min-h-10 w-full rounded-[10px] border border-slate-200 px-3 text-xs outline-none"><option value="paid">مدفوع</option><option value="pending">معلق</option></select></div><div className="space-y-1.5"><label htmlFor="expense-supplier" className="block text-[11px] font-bold text-slate-600">المورد</label><select id="expense-supplier" value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 px-3 text-xs outline-none"><option value="">بدون مورد</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></div></div><Button type="submit" className="mt-5">حفظ المصروف</Button></Card></form>}
      {error && !showForm && <div className="rounded-xl bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}
      <Card className="p-3 sm:p-4"><div className="grid gap-3 md:grid-cols-[1fr_180px]"><label className="flex min-h-10 items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3"><Search size={15} className="text-slate-400" /><input aria-label="بحث المصروفات" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="الوصف أو التصنيف..." className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label><select aria-label="تصفية الحالة" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value as typeof filterStatus)} className="min-h-10 rounded-[10px] border border-slate-200 px-3 text-xs outline-none"><option value="all">كل الحالات</option><option value="paid">مدفوع</option><option value="pending">معلق</option></select></div></Card>
      <Table minWidth="820px"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">الوصف</th><th className="p-4">التصنيف</th><th className="p-4">المورد</th><th className="p-4">التاريخ</th><th className="p-4">المبلغ</th><th className="p-4">الحالة</th><th className="p-4">الإجراء</th></tr></thead><tbody>{filtered.map((expense) => <tr key={expense.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50"><td className="p-4 text-xs font-bold text-slate-800">{expense.description}</td><td className="p-4 text-[10px] text-slate-500">{expense.category}</td><td className="p-4 text-[10px] text-slate-500">{suppliers.find((supplier) => supplier.id === expense.supplierId)?.name ?? "—"}</td><td className="p-4 text-[10px] text-slate-500">{formatDate(expense.date)}</td><td className="p-4 text-xs font-extrabold">{formatCurrency(expense.amount)}</td><td className="p-4"><Badge variant={expense.status === "paid" ? "success" : "warning"}>{expense.status === "paid" ? "مدفوع" : "معلق"}</Badge></td><td className="p-4"><button type="button" aria-label="حذف المصروف" className="rounded-lg border border-slate-200 p-1.5 text-rose-500 hover:bg-rose-50" onClick={() => removeExpense(expense.id)}><Trash2 size={13} /></button></td></tr>)}{filtered.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-xs text-slate-400">لا توجد مصروفات مطابقة.</td></tr>}</tbody></Table>
    </div>
  );
}
