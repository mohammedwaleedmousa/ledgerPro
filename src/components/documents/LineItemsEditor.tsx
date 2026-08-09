import { Package, Plus, Trash2 } from "lucide-react";
import type { Product } from "../../types/erp";
import Button from "../common/Button";
import Card from "../common/Card";

export type DocumentLineInput = {
  productId: string;
  quantity: number;
  unitAmount: number;
};

type Props = {
  products: Product[];
  items: DocumentLineInput[];
  mode: "sale" | "purchase";
  onChange: (items: DocumentLineInput[]) => void;
};

export default function LineItemsEditor({ products, items, mode, onChange }: Props) {
  const amountLabel = mode === "sale" ? "سعر البيع" : "تكلفة الوحدة";

  function addLine() {
    const product = products.find((entry) => !items.some((item) => item.productId === entry.id));
    if (!product) return;
    onChange([...items, { productId: product.id, quantity: 1, unitAmount: mode === "sale" ? product.price : product.cost }]);
  }

  function updateLine(index: number, patch: Partial<DocumentLineInput>) {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  function changeProduct(index: number, productId: string) {
    const product = products.find((entry) => entry.id === productId);
    if (!product) return;
    updateLine(index, { productId, unitAmount: mode === "sale" ? product.price : product.cost });
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-sm font-extrabold text-slate-900">بنود المستند</h2><p className="mt-1 text-[10px] text-slate-400">أضف المنتجات والكميات والأسعار المطلوبة.</p></div>
        <Button size="sm" variant="secondary" onClick={addLine} disabled={items.length >= products.length || products.length === 0}><Plus size={14} />إضافة بند</Button>
      </div>

      <div className="mt-4 max-w-full overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[650px] text-right">
          <thead><tr className="bg-slate-50 text-[9px] font-bold text-slate-400"><th className="px-3 py-2.5">المنتج</th><th className="px-3 py-2.5">الكمية</th><th className="px-3 py-2.5">{amountLabel}</th><th className="px-3 py-2.5">الإجمالي</th><th className="w-14 px-3 py-2.5">حذف</th></tr></thead>
          <tbody>
            {items.map((item, index) => {
              const product = products.find((entry) => entry.id === item.productId);
              return (
                <tr key={`${item.productId}-${index}`} className="border-t border-slate-100">
                  <td className="px-3 py-2.5"><div className="flex items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Package size={14} /></span><select value={item.productId} onChange={(event) => changeProduct(index, event.target.value)} className="min-h-9 min-w-48 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-blue-500">{products.map((entry) => <option key={entry.id} value={entry.id} disabled={items.some((line, lineIndex) => lineIndex !== index && line.productId === entry.id)}>{entry.name} · {entry.sku}</option>)}</select></div></td>
                  <td className="px-3 py-2.5"><input type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateLine(index, { quantity: Math.max(1, Number(event.target.value)) })} className="h-9 w-24 rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500" /></td>
                  <td className="px-3 py-2.5"><input type="number" min="0" step="0.01" value={item.unitAmount} onChange={(event) => updateLine(index, { unitAmount: Math.max(0, Number(event.target.value)) })} className="h-9 w-28 rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500" /></td>
                  <td className="px-3 py-2.5 text-xs font-extrabold text-slate-800 tabular-nums">{(item.quantity * item.unitAmount).toLocaleString("ar")}</td>
                  <td className="px-3 py-2.5"><button type="button" aria-label={`حذف ${product?.name ?? "البند"}`} onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 size={14} /></button></td>
                </tr>
              );
            })}
            {items.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-[11px] text-slate-400">لم تتم إضافة منتجات بعد.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
