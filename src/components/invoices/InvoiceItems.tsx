import { Plus, Trash2 } from "lucide-react";
import type { InvoiceInput, Product } from "../../types/erp";
import { formatCurrency } from "../../lib/format";
import Button from "../common/Button";
import Card from "../common/Card";

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
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-sm font-black text-slate-900">عناصر الفاتورة</h2><p className="mt-1 text-[10px] text-slate-400">يُحدّث المخزون عند حفظ الفاتورة</p></div>
        <Button size="sm" type="button" disabled={items.length >= availableProducts.length || availableProducts.length === 0} onClick={addItem}><Plus size={13} />إضافة منتج</Button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const selectedProduct = products.find((product) => product.id === item.productId);
          return (
            <div key={`${item.productId}-${index}`} className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 md:grid-cols-[minmax(180px,1fr)_100px_130px_120px_40px] md:items-end">
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500">المنتج</label><select value={item.productId} onChange={(event) => changeProduct(index, event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none">{availableProducts.map((product) => <option key={product.id} value={product.id} disabled={items.some((entry, entryIndex) => entryIndex !== index && entry.productId === product.id)}>{product.name} ({product.stock})</option>)}</select></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500">الكمية</label><input type="number" min="1" max={selectedProduct?.stock ?? 1} value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500">سعر الوحدة</label><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: Number(event.target.value) })} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none" /></div>
              <div className="space-y-1.5"><span className="block text-[10px] font-bold text-slate-500">الإجمالي</span><span className="flex min-h-10 items-center rounded-[10px] bg-white px-3 text-xs font-extrabold">{formatCurrency(item.quantity * item.unitPrice)}</span></div>
              <button type="button" aria-label="حذف العنصر" className="flex h-10 items-center justify-center rounded-[10px] text-rose-500 hover:bg-rose-50" onClick={() => onItemsChange(items.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={15} /></button>
            </div>
          );
        })}
        {items.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-[10px] text-slate-400">اضغط «إضافة منتج» لبدء الفاتورة.</div>}
      </div>
    </Card>
  );
}
