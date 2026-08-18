import { ArrowUpLeft, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";
import { appPaths } from "../../routes/navigation";

export default function TopProducts() {
  const { products, invoices } = useErp();
  const topProducts = products.map((product) => {
    const items = invoices.flatMap((invoice) => invoice.items).filter((item) => item.productId === product.id);
    return { ...product, sales: items.reduce((sum, item) => sum + item.quantity, 0), revenue: items.reduce((sum, item) => sum + item.total, 0) };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <article className="min-w-0 overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <div><h3 className="text-xs font-extrabold text-slate-900">المنتجات الأكثر مبيعًا</h3><p className="mt-1 text-[9px] text-slate-400">الترتيب حسب إجمالي الإيرادات</p></div>
        <Link to={appPaths.products} className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700">عرض الكل<ArrowUpLeft size={13} /></Link>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[660px] text-right">
          <thead><tr className="border-y border-slate-100 bg-slate-50/50 text-[8px] font-bold text-slate-400"><th className="px-5 py-2.5">المنتج</th><th className="px-4 py-2.5">SKU</th><th className="px-4 py-2.5">المباع</th><th className="px-4 py-2.5">الإيراد</th><th className="px-5 py-2.5">المخزون</th></tr></thead>
          <tbody>
            {topProducts.map((product) => {
              const lowStock = product.stock <= product.lowStockThreshold;
              return (
                <tr key={product.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3"><div className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500"><Package size={14} /></span><span className="max-w-[220px] truncate text-[11px] font-bold text-slate-800">{product.name}</span></div></td>
                  <td className="px-4 py-3 text-[10px] font-medium text-slate-400">{product.sku}</td>
                  <td className="px-4 py-3 text-[10px] font-bold text-slate-700 tabular-nums">{formatNumber(product.sales)}</td>
                  <td className="px-4 py-3 text-[10px] font-bold text-emerald-600 tabular-nums">{formatCurrency(product.revenue)}</td>
                  <td className="px-5 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-bold ${lowStock ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>{formatNumber(product.stock)} وحدة</span></td>
                </tr>
              );
            })}
            {topProducts.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-xs text-slate-400">لا توجد منتجات بعد.</td></tr>}
          </tbody>
        </table>
      </div>
    </article>
  );
}
