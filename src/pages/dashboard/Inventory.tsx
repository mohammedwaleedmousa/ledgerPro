import { useEffect, useState } from "react";
import InventoryHeader from "../../components/inventory/InventoryHeader";
import InventoryStats from "../../components/inventory/InventoryStats";
import InventoryTable from "../../components/inventory/InventoryTable";
import StockAlert from "../../components/inventory/StockAlert";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useErp } from "../../context/ErpContext";
import { apiRequest } from "../../lib/api";
import type { Product, StockMovement } from "../../types/erp";

type ProductPage = { items: Product[] };

export default function Inventory() {
  const { user } = useAuth();
  const erp = useErp();
  const isProduction = user?.mode === "supabase";
  const [products, setProducts] = useState<Product[]>(isProduction ? [] : erp.products);
  const [movements, setMovements] = useState<StockMovement[]>(isProduction ? [] : erp.stockMovements);
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(isProduction);
  const [saving, setSaving] = useState(false);

  async function loadProduction() {
    const [productResult, movementResult] = await Promise.all([
      apiRequest<ProductPage>("/erp/products?limit=100&page=1"),
      apiRequest<StockMovement[]>("/inventory/movements?limit=100"),
    ]);
    setProducts(productResult.items);
    setMovements(movementResult);
    setProductId((current) => current || productResult.items[0]?.id || "");
  }

  useEffect(() => {
    if (!isProduction) {
      setProducts(erp.products);
      setMovements(erp.stockMovements);
      setProductId((current) => current || erp.products[0]?.id || "");
      return;
    }
    let active = true;
    setLoading(true);
    void loadProduction().catch((loadError) => {
      if (active) setError(loadError instanceof Error ? loadError.message : "تعذر تحميل المخزون من الخادم.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [isProduction]);

  async function handleAdjustment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      if (isProduction) {
        await apiRequest("/inventory/adjust", {
          method: "POST",
          body: JSON.stringify({ productId, quantityDelta: Number(quantity), reference }),
        });
        await loadProduction();
      } else {
        erp.adjustStock(productId, Number(quantity), reference);
        setProducts(erp.products);
        setMovements(erp.stockMovements);
      }
      setQuantity("");
      setReference("");
      setError(null);
      setSuccess("تم تسجيل حركة المخزون وترحيلها.");
    } catch (adjustmentError) {
      setSuccess(null);
      setError(adjustmentError instanceof Error ? adjustmentError.message : "تعذر تعديل المخزون.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <InventoryHeader search={search} onSearchChange={setSearch} />
      {loading ? <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-500">جارٍ تحميل المخزون من الخادم...</div> : <InventoryStats products={products} movements={movements} />}

      <form onSubmit={handleAdjustment} className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)] sm:p-5">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center"><div><h2 className="text-sm font-black text-slate-900">تسجيل حركة مخزون</h2><p className="mt-1 text-[10px] text-slate-400">استخدم رقماً موجباً للإضافة وسالباً للخصم</p></div>{success && <span className="text-[10px] font-bold text-emerald-600">{success}</span>}</div>
        {isProduction && <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-[10px] text-blue-700">في وضع الإنتاج تُحدّث الكمية والمستودع وحركة المخزون والقيد المحاسبي داخل Transaction واحدة.</div>}
        {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_150px_1fr_auto] md:items-end">
          <div className="space-y-1.5"><label htmlFor="stock-product" className="block text-[11px] font-bold text-slate-600">المنتج</label><select id="stock-product" value={productId} onChange={(event) => setProductId(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 px-3 text-xs outline-none focus:border-blue-500" required>{products.map((product) => <option key={product.id} value={product.id}>{product.name} — {product.stock}</option>)}</select></div>
          <div className="space-y-1.5"><label htmlFor="stock-quantity" className="block text-[11px] font-bold text-slate-600">الكمية</label><input id="stock-quantity" type="number" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 px-3 text-xs outline-none focus:border-blue-500" required /></div>
          <div className="space-y-1.5"><label htmlFor="stock-reference" className="block text-[11px] font-bold text-slate-600">المرجع</label><input id="stock-reference" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="جرد، تلف، فرق فعلي..." className="min-h-10 w-full rounded-[10px] border border-slate-200 px-3 text-xs outline-none focus:border-blue-500" /></div>
          <Button type="submit" loading={saving}>حفظ الحركة</Button>
        </div>
      </form>

      {!loading && <div className="grid grid-cols-1 gap-4 xl:grid-cols-3"><div className="min-w-0 xl:col-span-2"><InventoryTable search={search} movements={movements} /></div><StockAlert products={products} /></div>}
    </div>
  );
}
