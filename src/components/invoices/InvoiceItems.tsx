import { Plus, Trash2 } from "lucide-react";
import type { InvoiceInput, Product } from "../../types/erp";
import { formatCurrency } from "../../lib/format";

type DraftItem = InvoiceInput["items"][number];

type Props = {
  products: Product[];
  items: DraftItem[];
  onItemsChange: (items: DraftItem[]) => void;
};

export default function InvoiceItems({ products, items, onItemsChange }: Props) {
  const availableProducts = products.filter((product) => product.isActive && product.stock > 0);

  function addItem() {
    const product = availableProducts.find((entry) => !items.some((item) => item.productId === entry.id));
    if (!product) return;
    onItemsChange([...items, { productId: product.id, quantity: 1, unitPrice: product.price }]);
  }

  function updateItem(index: number, updates: Partial<DraftItem>) {
    onItemsChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...updates } : item));
  }

  function changeProduct(index: number, productId: string) {
    const product = products.find((entry) => entry.id === productId);
    if (!product) return;
    updateItem(index, { productId, quantity: 1, unitPrice: product.price });
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold">عناصر الفاتورة</h2><p className="mt-1 text-sm text-gray-400">سيُخصم المخزون عند حفظ الفاتورة</p></div>
        <button type="button" disabled={items.length >= availableProducts.length || availableProducts.length === 0} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={addItem}><Plus size={16} />إضافة منتج</button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const selectedProduct = products.find((product) => product.id === item.productId);
          return (
            <div key={`${item.productId}-${index}`} className="grid gap-3 rounded-2xl bg-gray-50 p-4 md:grid-cols-[minmax(180px,1fr)_110px_140px_130px_44px] md:items-end">
              <div className="space-y-1.5"><label className="text-xs font-medium text-gray-500">المنتج</label><select value={item.productId} onChange={(event) => changeProduct(index, event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none">{availableProducts.map((product) => <option key={product.id} value={product.id} disabled={items.some((entry, entryIndex) => entryIndex !== index && entry.productId === product.id)}>{product.name} ({product.stock})</option>)}</select></div>
              <div className="space-y-1.5"><label className="text-xs font-medium text-gray-500">الكمية</label><input type="number" min="1" max={selectedProduct?.stock ?? 1} value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none" /></div>
              <div className="space-y-1.5"><label className="text-xs font-medium text-gray-500">سعر الوحدة</label><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: Number(event.target.value) })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none" /></div>
              <div className="space-y-1.5"><span className="block text-xs font-medium text-gray-500">الإجمالي</span><span className="block rounded-xl bg-white px-3 py-2.5 font-semibold">{formatCurrency(item.quantity * item.unitPrice)}</span></div>
              <button type="button" aria-label="حذف العنصر" className="flex h-11 items-center justify-center rounded-xl text-red-500 hover:bg-red-50" onClick={() => onItemsChange(items.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={18} /></button>
            </div>
          );
        })}
        {items.length === 0 && <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">اضغط «إضافة منتج» لبدء الفاتورة.</div>}
      </div>
    </div>
  );
}
