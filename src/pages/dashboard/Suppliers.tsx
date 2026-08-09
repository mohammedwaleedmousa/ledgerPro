import { Trash2, Truck } from "lucide-react";
import { useState } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Table from "../../components/common/Table";
import { useErp } from "../../context/ErpContext";
import { formatCurrency } from "../../lib/format";

export default function Suppliers() {
  const { suppliers, expenses, addSupplier, removeSupplier } = useErp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [balance, setBalance] = useState("0");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      addSupplier({ name, email: email.trim(), phone: phone.trim(), balance: Number(balance), status: "active", notes: notes.trim() });
      setName(""); setEmail(""); setPhone(""); setBalance("0"); setNotes(""); setError(null);
    } catch (supplierError) {
      setError(supplierError instanceof Error ? supplierError.message : "تعذر إضافة المورد.");
    }
  }

  function handleDelete(id: string, supplierName: string) {
    if (!window.confirm(`هل تريد حذف المورد «${supplierName}»؟`)) return;
    try { removeSupplier(id); setError(null); } catch (supplierError) { setError(supplierError instanceof Error ? supplierError.message : "تعذر حذف المورد."); }
  }

  return (
    <div className="space-y-6">
      <header><h1 className="text-3xl font-bold text-gray-900">الموردون</h1><p className="mt-2 text-gray-500">إدارة بيانات الموردين والأرصدة والمصروفات المرتبطة</p></header>
      <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-100 bg-white p-6"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Truck size={21} /></span><h2 className="font-bold">إضافة مورد</h2></div>{error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}<div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5 xl:items-end"><Input label="اسم المورد" value={name} onChange={(event) => setName(event.target.value)} required /><Input label="البريد" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /><Input label="الهاتف" value={phone} onChange={(event) => setPhone(event.target.value)} /><Input label="الرصيد" type="number" min="0" step="0.01" value={balance} onChange={(event) => setBalance(event.target.value)} /><div className="xl:row-span-2"><Button type="submit" className="w-full">إضافة المورد</Button></div><div className="md:col-span-2 xl:col-span-4"><Input label="ملاحظات" value={notes} onChange={(event) => setNotes(event.target.value)} /></div></div></form>
      <Table><thead className="border-b bg-gray-50"><tr><th className="p-5 text-sm text-gray-500">المورد</th><th className="p-5 text-sm text-gray-500">التواصل</th><th className="p-5 text-sm text-gray-500">الرصيد</th><th className="p-5 text-sm text-gray-500">المصروفات</th><th className="p-5 text-sm text-gray-500">الحالة</th><th className="p-5 text-sm text-gray-500">الإجراء</th></tr></thead><tbody>{suppliers.map((supplier) => <tr key={supplier.id} className="border-b last:border-none"><td className="p-5 font-medium">{supplier.name}</td><td className="p-5"><p className="text-sm text-gray-600">{supplier.phone || "—"}</p><p className="mt-1 text-xs text-gray-400">{supplier.email || "لا يوجد بريد"}</p></td><td className="p-5 font-semibold">{formatCurrency(supplier.balance)}</td><td className="p-5 text-gray-500">{expenses.filter((expense) => expense.supplierId === supplier.id).length}</td><td className="p-5"><Badge>نشط</Badge></td><td className="p-5"><button type="button" aria-label={`حذف ${supplier.name}`} className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => handleDelete(supplier.id, supplier.name)}><Trash2 size={17} /></button></td></tr>)}{suppliers.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-gray-400">لا يوجد موردون.</td></tr>}</tbody></Table>
    </div>
  );
}
