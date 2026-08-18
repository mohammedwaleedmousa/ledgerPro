import { CircleDollarSign, PackageCheck, Plus, ShoppingCart, Truck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Table from "../../components/common/Table";
import LineItemsEditor, { type DocumentLineInput } from "../../components/documents/LineItemsEditor";
import { useAuth } from "../../context/AuthContext";
import { useErp } from "../../context/ErpContext";
import { apiRequest } from "../../lib/api";
import { formatCurrency, formatDate, formatNumber } from "../../lib/format";
import type { CompanySettings, Product, PurchaseOrder, Supplier } from "../../types/erp";

const statusLabels: Record<PurchaseOrder["status"], string> = { draft: "مسودة", ordered: "مطلوب", received: "مستلم", cancelled: "ملغي" };

type PageResult<T> = { items: T[]; page: number; limit: number; total: number };
type BootstrapResult = { settings: CompanySettings };

function dateWithOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function PurchaseOrders() {
  const { user } = useAuth();
  const erp = useErp();
  const isProduction = user?.mode === "supabase";
  const [productionOrders, setProductionOrders] = useState<PurchaseOrder[]>([]);
  const [productionSuppliers, setProductionSuppliers] = useState<Supplier[]>([]);
  const [productionProducts, setProductionProducts] = useState<Product[]>([]);
  const [productionSettings, setProductionSettings] = useState<CompanySettings | null>(null);
  const purchaseOrders = isProduction ? productionOrders : erp.purchaseOrders;
  const suppliers = isProduction ? productionSuppliers : erp.suppliers;
  const products = isProduction ? productionProducts : erp.products;
  const settings = isProduction ? productionSettings ?? erp.settings : erp.settings;
  const [showForm, setShowForm] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [issueDate, setIssueDate] = useState(() => dateWithOffset(0));
  const [expectedDate, setExpectedDate] = useState(() => dateWithOffset(7));
  const [status, setStatus] = useState<"draft" | "ordered">("ordered");
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DocumentLineInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(isProduction);
  const [saving, setSaving] = useState(false);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitAmount, 0), [items]);
  const total = subtotal * (1 + Math.max(0, taxRate) / 100);

  async function loadProduction() {
    if (!isProduction) return;
    setLoading(true);
    try {
      const [orders, supplierRows, productRows, bootstrap] = await Promise.all([
        apiRequest<PurchaseOrder[]>("/purchases?limit=100"),
        apiRequest<Supplier[]>("/suppliers?limit=200"),
        apiRequest<PageResult<Product>>("/erp/products?limit=100&page=1"),
        apiRequest<BootstrapResult>("/erp/bootstrap"),
      ]);
      setProductionOrders(orders);
      setProductionSuppliers(supplierRows);
      setProductionProducts(productRows.items);
      setProductionSettings(bootstrap.settings);
      setTaxRate((current) => current === erp.settings.taxRate ? bootstrap.settings.taxRate : current);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "تعذر تحميل أوامر الشراء.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadProduction(); }, [isProduction]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      if (isProduction) {
        const result = await apiRequest<{ purchase_number?: string }>("/purchases", {
          method: "POST",
          body: JSON.stringify({ supplierId, issueDate, expectedDate, status, taxRate, notes, items: items.map((item) => ({ productId: item.productId, quantity: item.quantity, unitCost: item.unitAmount })) }),
        });
        await loadProduction();
        setMessage(`تم إنشاء أمر الشراء ${result.purchase_number ?? ""}.`);
      } else {
        const order = erp.createPurchaseOrder({ supplierId, issueDate, expectedDate, status, taxRate, notes, items: items.map((item) => ({ productId: item.productId, quantity: item.quantity, unitCost: item.unitAmount })) });
        setMessage(`تم إنشاء أمر الشراء ${order.number}.`);
      }
      setSupplierId(""); setItems([]); setNotes(""); setError(null); setShowForm(false);
    } catch (saveError) {
      setMessage(null);
      setError(saveError instanceof Error ? saveError.message : "تعذر إنشاء أمر الشراء.");
    } finally {
      setSaving(false);
    }
  }

  async function handleOrdered(id: string) {
    try {
      if (isProduction) {
        await apiRequest(`/purchases/${id}/ordered`, { method: "PATCH" });
        await loadProduction();
      } else {
        erp.updatePurchaseOrderStatus(id, "ordered");
      }
      setError(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "تعذر تحديث حالة أمر الشراء.");
    }
  }

  async function handleReceive(id: string) {
    try {
      if (isProduction) {
        await apiRequest(`/purchases/${id}/receive`, { method: "POST" });
        await loadProduction();
      } else {
        erp.receivePurchaseOrder(id);
      }
      setError(null);
      setMessage("تم استلام الأمر وتحديث المخزون وذمة المورد والقيد المحاسبي.");
    } catch (receiveError) {
      setMessage(null);
      setError(receiveError instanceof Error ? receiveError.message : "تعذر استلام أمر الشراء.");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="أوامر الشراء" description="تابع طلبات الموردين واستلم المنتجات مباشرة إلى المخزون." eyebrow="المشتريات" actions={<Button onClick={() => setShowForm((current) => !current)}>{showForm ? <X size={15} /> : <Plus size={15} />}{showForm ? "إغلاق النموذج" : "أمر شراء جديد"}</Button>} />
      {message && <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[11px] font-bold text-emerald-700">{message}</div>}
      {error && !showForm && <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-[11px] font-bold text-rose-700">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard title="إجمالي الأوامر" value={formatNumber(purchaseOrders.length)} icon={ShoppingCart} /><StatCard title="بانتظار الاستلام" value={formatNumber(purchaseOrders.filter((item) => item.status === "ordered").length)} icon={Truck} tone="amber" /><StatCard title="أوامر مستلمة" value={formatNumber(purchaseOrders.filter((item) => item.status === "received").length)} icon={PackageCheck} tone="emerald" /><StatCard title="قيمة المشتريات" value={formatCurrency(purchaseOrders.reduce((sum, item) => sum + item.total, 0))} icon={CircleDollarSign} /></div>

      {showForm && <form onSubmit={handleSave} className="space-y-4"><Card><div><h2 className="text-sm font-extrabold text-slate-900">بيانات أمر الشراء</h2><p className="mt-1 text-[10px] text-slate-400">لن يتغير المخزون أو رصيد المورد إلا عند الاستلام.</p></div>{error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-[11px] font-medium text-rose-700">{error}</div>}<div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><div className="space-y-1.5"><label htmlFor="purchase-supplier" className="block text-[11px] font-bold text-slate-600">المورد</label><select id="purchase-supplier" value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none" required><option value="">اختر المورد</option>{suppliers.filter((supplier) => supplier.status === "active").map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></div><Input label="تاريخ الطلب" type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} required /><Input label="الاستلام المتوقع" type="date" value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} required /><div className="space-y-1.5"><label htmlFor="purchase-status" className="block text-[11px] font-bold text-slate-600">الحالة</label><select id="purchase-status" value={status} onChange={(event) => setStatus(event.target.value as "draft" | "ordered")} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none"><option value="draft">مسودة</option><option value="ordered">تم الطلب</option></select></div><Input label="الضريبة %" type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(event) => setTaxRate(Number(event.target.value))} /><div className="space-y-1.5 md:col-span-2 xl:col-span-3"><label htmlFor="purchase-notes" className="block text-[11px] font-bold text-slate-600">ملاحظات</label><textarea id="purchase-notes" value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 px-3 py-2.5 text-xs outline-none" /></div></div></Card><LineItemsEditor products={products} items={items} mode="purchase" onChange={setItems} /><Card className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-[10px] text-slate-400">الإجمالي شامل الضريبة</p><p className="mt-1 text-2xl font-black text-slate-950">{formatCurrency(total)}</p></div><Button type="submit" loading={saving}><ShoppingCart size={15} />حفظ أمر الشراء</Button></Card></form>}

      {loading ? <Card className="text-center text-xs text-slate-500">جارٍ تحميل أوامر الشراء...</Card> : <Table minWidth="900px"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">الرقم</th><th className="p-4">المورد</th><th className="p-4">تاريخ الطلب</th><th className="p-4">الاستلام المتوقع</th><th className="p-4">البنود</th><th className="p-4">الإجمالي</th><th className="p-4">الحالة</th><th className="p-4">الإجراء</th></tr></thead><tbody>{purchaseOrders.map((order) => <tr key={order.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"><td className="p-4 font-mono text-[11px] font-bold text-blue-700">{order.number}</td><td className="p-4 text-xs font-bold text-slate-700">{order.supplierName}</td><td className="p-4 text-[10px] text-slate-500">{formatDate(order.issueDate)}</td><td className="p-4 text-[10px] text-slate-500">{formatDate(order.expectedDate)}</td><td className="p-4 text-[10px] text-slate-500">{formatNumber(order.items.reduce((sum, item) => sum + item.quantity, 0))}</td><td className="p-4 text-xs font-extrabold">{formatCurrency(order.total)}</td><td className="p-4"><Badge variant={order.status === "received" ? "success" : order.status === "ordered" ? "warning" : order.status === "cancelled" ? "danger" : "neutral"}>{statusLabels[order.status]}</Badge></td><td className="p-4">{order.status === "draft" ? <Button size="sm" variant="secondary" onClick={() => void handleOrdered(order.id)}><Truck size={13} />إرسال الطلب</Button> : order.status === "ordered" ? <Button size="sm" variant="secondary" onClick={() => void handleReceive(order.id)}><PackageCheck size={13} />استلام</Button> : <span className="text-[9px] text-slate-400">—</span>}</td></tr>)}{purchaseOrders.length === 0 && <tr><td colSpan={8} className="p-12 text-center text-xs text-slate-400">لا توجد أوامر شراء.</td></tr>}</tbody></Table>}
    </div>
  );
}
