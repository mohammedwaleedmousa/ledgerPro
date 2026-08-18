import { Boxes, Building2, MapPin, Package, Plus } from "lucide-react";
import { useState } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";

export default function Warehouses() {
  const { warehouses, products, addWarehouse } = useErp();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const stockUnits = products.reduce((sum, product) => sum + product.stock, 0);
  const inventoryValue = products.reduce((sum, product) => sum + product.stock * product.cost, 0);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      addWarehouse({ name, location });
      setName(""); setLocation(""); setError(null); setMessage("تمت إضافة المستودع.");
    } catch (warehouseError) {
      setMessage(null);
      setError(warehouseError instanceof Error ? warehouseError.message : "تعذر إضافة المستودع.");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="المستودعات" description="أدر مواقع التخزين واستعد لتوزيع المخزون والتحويل بين الفروع." eyebrow="المخزون" />
      {message && <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[11px] font-bold text-emerald-700">{message}</div>}
      <div className="grid gap-3 md:grid-cols-3"><StatCard title="المستودعات النشطة" value={formatNumber(warehouses.filter((item) => item.isActive).length)} icon={Building2} /><StatCard title="إجمالي الوحدات" value={formatNumber(stockUnits)} icon={Boxes} tone="emerald" /><StatCard title="قيمة المخزون" value={formatCurrency(inventoryValue)} icon={Package} /></div>

      <form onSubmit={handleSubmit}><Card><div><h2 className="text-sm font-extrabold text-slate-900">إضافة مستودع</h2><p className="mt-1 text-[10px] text-slate-400">المستودع الأول يُعامل كموقع افتراضي.</p></div>{error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}<div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"><Input label="اسم المستودع" value={name} onChange={(event) => setName(event.target.value)} required /><Input label="الموقع" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="المدينة أو العنوان" /><Button type="submit"><Plus size={15} />إضافة</Button></div></Card></form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {warehouses.map((warehouse) => <Card key={warehouse.id}><div className="flex items-start justify-between gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Building2 size={18} /></span><div className="flex gap-2"><Badge>{warehouse.isActive ? "نشط" : "متوقف"}</Badge>{warehouse.isDefault && <Badge variant="info">افتراضي</Badge>}</div></div><h2 className="mt-4 text-sm font-extrabold text-slate-900">{warehouse.name}</h2><p className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400"><MapPin size={12} />{warehouse.location || "بدون موقع محدد"}</p><div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4"><div><p className="text-[9px] text-slate-400">الوحدات</p><p className="mt-1 text-sm font-extrabold text-slate-800">{warehouse.isDefault ? formatNumber(stockUnits) : "٠"}</p></div><div><p className="text-[9px] text-slate-400">المنتجات</p><p className="mt-1 text-sm font-extrabold text-slate-800">{warehouse.isDefault ? formatNumber(products.length) : "٠"}</p></div></div></Card>)}
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[10px] leading-5 text-blue-700">أُضيفت بنية المستودعات. توزيع الرصيد لكل مستودع والتحويلات سيعتمدان على جدول أرصدة مستقل في Supabase حتى لا يتغير المخزون الإجمالي بشكل غير ذرّي.</div>
    </div>
  );
}
