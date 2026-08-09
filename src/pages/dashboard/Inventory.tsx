import { useState } from "react";
import InventoryHeader from "../../components/inventory/InventoryHeader";
import InventoryStats from "../../components/inventory/InventoryStats";
import InventoryTable from "../../components/inventory/InventoryTable";
import StockAlert from "../../components/inventory/StockAlert";
import Button from "../../components/common/Button";
import { useErp } from "../../context/ErpContext";

export default function Inventory() {
  const { products, adjustStock } = useErp();
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleAdjustment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      adjustStock(productId, Number(quantity), reference);
      setQuantity("");
      setReference("");
      setError(null);
      setSuccess("تم تسجيل حركة المخزون.");
    } catch (adjustmentError) {
      setSuccess(null);
      setError(adjustmentError instanceof Error ? adjustmentError.message : "تعذر تعديل المخزون.");
    }
  }

  return (
    <div className="space-y-6">
      <InventoryHeader search={search} onSearchChange={setSearch} />
      <InventoryStats />

      <form onSubmit={handleAdjustment} className="rounded-3xl border border-gray-100 bg-white p-6">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center"><div><h2 className="text-lg font-bold">تسجيل حركة مخزون</h2><p className="mt-1 text-sm text-gray-400">استخدم رقمًا موجبًا للإضافة وسالبًا للخصم</p></div>{success && <span className="text-sm font-medium text-emerald-600">{success}</span>}</div>
        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_1fr_auto] md:items-end">
          <div className="space-y-2"><label htmlFor="stock-product" className="block text-sm font-medium text-gray-600">المنتج</label><select id="stock-product" value={productId} onChange={(event) => setProductId(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" required>{products.map((product) => <option key={product.id} value={product.id}>{product.name} — {product.stock}</option>)}</select></div>
          <div className="space-y-2"><label htmlFor="stock-quantity" className="block text-sm font-medium text-gray-600">الكمية</label><input id="stock-quantity" type="number" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" required /></div>
          <div className="space-y-2"><label htmlFor="stock-reference" className="block text-sm font-medium text-gray-600">المرجع</label><input id="stock-reference" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="شراء، جرد، تلف..." className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" /></div>
          <Button type="submit">حفظ الحركة</Button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3"><div className="min-w-0 xl:col-span-2"><InventoryTable search={search} /></div><StockAlert /></div>
    </div>
  );
}
