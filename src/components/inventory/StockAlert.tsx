import { TriangleAlert } from "lucide-react";
import { useErp } from "../../context/ErpContext";
import { formatNumber } from "../../lib/format";
import type { Product } from "../../types/erp";
import Badge from "../common/Badge";
import Card from "../common/Card";

export default function StockAlert({ products: suppliedProducts }: { products?: Product[] }) {
  const erp = useErp();
  const products = suppliedProducts ?? erp.products;
  const lowStockProducts = products.filter((product) => product.stock <= product.lowStockThreshold).sort((a, b) => a.stock - b.stock);

  return (
    <Card>
      <div className="flex items-center justify-between"><div><h3 className="text-sm font-black text-slate-900">تنبيهات المخزون</h3><p className="mt-1 text-[9px] text-slate-400">المنتجات عند حد إعادة الطلب</p></div><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><TriangleAlert size={15} /></span></div>
      <div className="mt-4 space-y-2">{lowStockProducts.map((product) => <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="min-w-0"><p className="truncate text-[11px] font-bold text-slate-700">{product.name}</p><p className="mt-1 text-[9px] text-slate-400">حد الطلب: {formatNumber(product.lowStockThreshold)}</p></div><Badge variant={product.stock === 0 ? "danger" : "warning"}>{formatNumber(product.stock)} متبقي</Badge></div>)}{lowStockProducts.length === 0 && <div className="rounded-xl bg-emerald-50 p-4 text-center text-[10px] font-bold text-emerald-700">المخزون ضمن الحدود الآمنة.</div>}</div>
    </Card>
  );
}
