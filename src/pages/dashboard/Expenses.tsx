import { ReceiptText, Trash2 } from "lucide-react";
import { useState } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Table from "../../components/common/Table";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatDate } from "../../lib/format";

export default function Expenses() {
  const { expenses, suppliers, addExpense, removeExpense } = useErp();
  const [category, setCategory] = useState("تشغيل");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<"paid" | "pending">("paid");
  const [supplierId, setSupplierId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const totalPaid = expenses.filter((expense) => expense.status === "paid").reduce((sum, expense) => sum + expense.amount, 0);
  const totalPending = expenses.filter((expense) => expense.status === "pending").reduce((sum, expense) => sum + expense.amount, 0);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      addExpense({ category, description, amount: Number(amount), date, status, supplierId });
      setDescription(""); setAmount(""); setSupplierId(""); setError(null);
    } catch (expenseError) {
      setError(expenseError instanceof Error ? expenseError.message : "تعذر حفظ المصروف.");
    }
  }

  return (
    <div className="space-y-6">
      <header><h1 className="text-3xl font-bold text-gray-900">المصروفات</h1><p className="mt-2 text-gray-500">تسجيل ومتابعة المصروفات التشغيلية</p></header>
      <div className="grid gap-5 md:grid-cols-3"><div className="rounded-3xl border border-gray-100 bg-white p-6"><p className="text-sm text-gray-400">إجمالي المدفوع</p><p className="mt-4 text-3xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p></div><div className="rounded-3xl border border-gray-100 bg-white p-6"><p className="text-sm text-gray-400">قيد الانتظار</p><p className="mt-4 text-3xl font-bold text-amber-600">{formatCurrency(totalPending)}</p></div><div className="rounded-3xl border border-gray-100 bg-white p-6"><p className="text-sm text-gray-400">عدد السجلات</p><p className="mt-4 text-3xl font-bold text-gray-900">{expenses.length}</p></div></div>
      <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-100 bg-white p-6"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><ReceiptText size={21} /></span><h2 className="font-bold">تسجيل مصروف</h2></div>{error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}<div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3"><div className="space-y-2"><label htmlFor="expense-category" className="block text-sm font-medium text-gray-600">التصنيف</label><select id="expense-category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"><option>تشغيل</option><option>إيجار</option><option>خدمات</option><option>رواتب</option><option>تسويق</option><option>أخرى</option></select></div><Input label="الوصف" value={description} onChange={(event) => setDescription(event.target.value)} required /><Input label="المبلغ" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /><Input label="التاريخ" type="date" value={date} onChange={(event) => setDate(event.target.value)} required /><div className="space-y-2"><label htmlFor="expense-status" className="block text-sm font-medium text-gray-600">الحالة</label><select id="expense-status" value={status} onChange={(event) => setStatus(event.target.value as "paid" | "pending")} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"><option value="paid">مدفوع</option><option value="pending">معلق</option></select></div><div className="space-y-2"><label htmlFor="expense-supplier" className="block text-sm font-medium text-gray-600">المورد</label><select id="expense-supplier" value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"><option value="">بدون مورد</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></div></div><Button type="submit" className="mt-5">حفظ المصروف</Button></form>
      <Table><thead className="border-b bg-gray-50"><tr><th className="p-5 text-sm text-gray-500">الوصف</th><th className="p-5 text-sm text-gray-500">التصنيف</th><th className="p-5 text-sm text-gray-500">المورد</th><th className="p-5 text-sm text-gray-500">التاريخ</th><th className="p-5 text-sm text-gray-500">المبلغ</th><th className="p-5 text-sm text-gray-500">الحالة</th><th className="p-5 text-sm text-gray-500">الإجراء</th></tr></thead><tbody>{expenses.map((expense) => <tr key={expense.id} className="border-b last:border-none"><td className="p-5 font-medium">{expense.description}</td><td className="p-5 text-gray-500">{expense.category}</td><td className="p-5 text-gray-500">{suppliers.find((supplier) => supplier.id === expense.supplierId)?.name ?? "—"}</td><td className="p-5 text-gray-500">{formatDate(expense.date)}</td><td className="p-5 font-semibold">{formatCurrency(expense.amount)}</td><td className="p-5"><Badge variant={expense.status === "paid" ? "success" : "warning"}>{expense.status === "paid" ? "مدفوع" : "معلق"}</Badge></td><td className="p-5"><button type="button" aria-label="حذف المصروف" className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => removeExpense(expense.id)}><Trash2 size={17} /></button></td></tr>)}{expenses.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-gray-400">لا توجد مصروفات.</td></tr>}</tbody></Table>
    </div>
  );
}
