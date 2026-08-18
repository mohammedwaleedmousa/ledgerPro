import { CircleDollarSign, Plus, Search, Trash2, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Table from "../../components/common/Table";
import { useAuth } from "../../context/AuthContext";
import { useErp } from "../../context/ErpContext";
import { apiRequest } from "../../lib/api";
import { formatCurrency, formatNumber } from "../../lib/format";
import type { Supplier } from "../../types/erp";

export default function Suppliers() {
  const { user } = useAuth();
  const erp = useErp();
  const isProduction = user?.mode === "supabase";
  const [productionSuppliers, setProductionSuppliers] = useState<Supplier[]>([]);
  const suppliers = isProduction ? productionSuppliers : erp.suppliers;
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [balance, setBalance] = useState("0");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isProduction);
  const [saving, setSaving] = useState(false);

  async function loadSuppliers() {
    if (!isProduction) return;
    setLoading(true);
    try {
      setProductionSuppliers(await apiRequest<Supplier[]>("/suppliers?limit=200"));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "تعذر تحميل الموردين.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadSuppliers(); }, [isProduction]);

  const normalized = search.trim().toLowerCase();
  const filtered = useMemo(() => suppliers.filter((supplier) => !normalized || [supplier.name, supplier.email, supplier.phone].some((value) => value.toLowerCase().includes(normalized))), [normalized, suppliers]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      if (isProduction) {
        await apiRequest("/suppliers", { method: "POST", body: JSON.stringify({ name, email: email.trim(), phone: phone.trim(), balance: Number(balance), status: "active", notes: notes.trim() }) });
        await loadSuppliers();
      } else {
        erp.addSupplier({ name, email: email.trim(), phone: phone.trim(), balance: Number(balance), status: "active", notes: notes.trim() });
      }
      setName(""); setEmail(""); setPhone(""); setBalance("0"); setNotes(""); setError(null); setShowForm(false);
    } catch (supplierError) {
      setError(supplierError instanceof Error ? supplierError.message : "تعذر إضافة المورد.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, supplierName: string) {
    if (!window.confirm(`هل تريد تعطيل المورد «${supplierName}»؟`)) return;
    try {
      if (isProduction) {
        await apiRequest(`/suppliers/${id}`, { method: "DELETE" });
        await loadSuppliers();
      } else {
        erp.removeSupplier(id);
      }
      setError(null);
    } catch (supplierError) {
      setError(supplierError instanceof Error ? supplierError.message : "تعذر تعطيل المورد.");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="الموردون" description="إدارة بيانات الموردين وأرصدة الاستحقاق ودورة المشتريات." eyebrow="المشتريات" actions={<Button onClick={() => setShowForm((current) => !current)}><Plus size={14} />{showForm ? "إغلاق" : "إضافة مورد"}</Button>} />
      <div className="grid gap-3 md:grid-cols-2"><StatCard title="إجمالي الموردين" value={formatNumber(suppliers.length)} icon={Truck} /><StatCard title="أرصدة الموردين" value={formatCurrency(suppliers.reduce((sum, supplier) => sum + supplier.balance, 0))} icon={CircleDollarSign} tone="amber" /></div>

      {showForm && <form onSubmit={handleSubmit}><Card>{error && <div className="mb-4 rounded-xl bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 xl:items-end"><Input label="اسم المورد" value={name} onChange={(event) => setName(event.target.value)} required /><Input label="البريد" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /><Input label="الهاتف" value={phone} onChange={(event) => setPhone(event.target.value)} /><Input label="الرصيد الافتتاحي" type="number" min="0" step="0.01" value={balance} onChange={(event) => setBalance(event.target.value)} /><Button type="submit" loading={saving}>حفظ المورد</Button><div className="md:col-span-2 xl:col-span-5"><Input label="ملاحظات" value={notes} onChange={(event) => setNotes(event.target.value)} /></div></div></Card></form>}
      {error && !showForm && <div className="rounded-xl bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}
      <Card className="p-3 sm:p-4"><label className="flex min-h-10 max-w-xl items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3"><Search size={15} className="text-slate-400" /><input aria-label="البحث عن مورد" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="الاسم أو الهاتف أو البريد..." className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label></Card>
      {loading ? <Card className="text-center text-xs text-slate-500">جارٍ تحميل الموردين...</Card> : <Table minWidth="760px"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">المورد</th><th className="p-4">التواصل</th><th className="p-4">الرصيد</th><th className="p-4">الحالة</th><th className="p-4">الإجراء</th></tr></thead><tbody>{filtered.map((supplier) => <tr key={supplier.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50"><td className="p-4 text-xs font-bold text-slate-800">{supplier.name}</td><td className="p-4"><p className="text-[10px] text-slate-600">{supplier.phone || "—"}</p><p className="mt-1 text-[9px] text-slate-400">{supplier.email || "لا يوجد بريد"}</p></td><td className="p-4 text-xs font-extrabold">{formatCurrency(supplier.balance)}</td><td className="p-4"><Badge variant={supplier.status === "active" ? "success" : "danger"}>{supplier.status === "active" ? "نشط" : "غير نشط"}</Badge></td><td className="p-4"><button type="button" aria-label={`تعطيل ${supplier.name}`} className="rounded-lg border border-slate-200 p-1.5 text-rose-500 hover:bg-rose-50" onClick={() => void handleDelete(supplier.id, supplier.name)}><Trash2 size={13} /></button></td></tr>)}{filtered.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-xs text-slate-400">لا يوجد موردون مطابقون.</td></tr>}</tbody></Table>}
    </div>
  );
}
