import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";
import { appPaths } from "../../routes/navigation";
import type { Category, Product } from "../../types/erp";
import Badge from "../common/Badge";
import Table from "../common/Table";

type Props = {
  search: string;
  categoryId: string;
  products?: Product[];
  categories?: Category[];
  readOnlyActions?: boolean;
};

export default function ProductTable({ search, categoryId, products: suppliedProducts, categories: suppliedCategories, readOnlyActions = false }: Props) {
  const navigate = useNavigate();
  const erp = useErp();
  const products = suppliedProducts ?? erp.products;
  const categories = suppliedCategories ?? erp.categories;
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesSearch = !normalizedSearch || product.name.toLowerCase().includes(normalizedSearch) || product.sku.toLowerCase().includes(normalizedSearch);
    return matchesSearch && (!categoryId || product.categoryId === categoryId);
  }), [categoryId, normalizedSearch, products]);
  const pageSize = 25;
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleDelete(id: string, name: string) {
    if (readOnlyActions) return;
    if (!window.confirm(`هل تريد حذف المنتج «${name}»؟`)) return;
    try {
      erp.removeProduct(id);
      setError(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "تعذر حذف المنتج.");
    }
  }

  return (
    <div className="space-y-3">
      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}
      <Table minWidth="820px">
        <thead className="border-b border-slate-100 bg-slate-50/70">
          <tr>
            <th className="p-4 text-[9px] font-bold text-slate-400">المنتج</th>
            <th className="p-4 text-[9px] font-bold text-slate-400">SKU</th>
            <th className="p-4 text-[9px] font-bold text-slate-400">التصنيف</th>
            <th className="p-4 text-[9px] font-bold text-slate-400">التكلفة</th>
            <th className="p-4 text-[9px] font-bold text-slate-400">السعر</th>
            <th className="p-4 text-[9px] font-bold text-slate-400">المخزون</th>
            <th className="p-4 text-[9px] font-bold text-slate-400">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {visibleProducts.map((product) => (
            <tr key={product.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50">
              <td className="p-4 text-xs font-bold text-slate-800">{product.name}</td>
              <td className="p-4 font-mono text-[10px] font-bold text-blue-700">{product.sku}</td>
              <td className="p-4 text-[10px] text-slate-500">{categories.find((category) => category.id === product.categoryId)?.name ?? "بدون تصنيف"}</td>
              <td className="p-4 text-[10px] text-slate-600">{formatCurrency(product.cost)}</td>
              <td className="p-4 text-xs font-extrabold text-slate-900">{formatCurrency(product.price)}</td>
              <td className="p-4"><Badge variant={product.stock <= product.lowStockThreshold ? "warning" : "success"}>{formatNumber(product.stock)} {product.stock <= product.lowStockThreshold ? "منخفض" : "متوفر"}</Badge></td>
              <td className="p-4">
                {readOnlyActions ? (
                  <span className="text-[9px] font-medium text-slate-400">إدارة الخادم قيد الربط</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label={`تعديل ${product.name}`} className="rounded-lg border border-slate-200 p-1.5 text-blue-600 hover:bg-blue-50" onClick={() => navigate(appPaths.editProduct(product.id))}><Pencil size={13} /></button>
                    <button type="button" aria-label={`حذف ${product.name}`} className="rounded-lg border border-slate-200 p-1.5 text-rose-500 hover:bg-rose-50" onClick={() => handleDelete(product.id, product.name)}><Trash2 size={13} /></button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {filteredProducts.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-xs text-slate-400">لا توجد منتجات مطابقة.</td></tr>}
        </tbody>
      </Table>
      {filteredProducts.length > 0 && <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 sm:flex-row sm:items-center"><p className="text-[10px] text-slate-500">عرض {formatNumber((currentPage - 1) * pageSize + 1)}–{formatNumber(Math.min(currentPage * pageSize, filteredProducts.length))} من {formatNumber(filteredProducts.length)}</p><div className="flex items-center gap-2"><button type="button" aria-label="الصفحة السابقة" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30"><ChevronRight size={14} /></button><span className="min-w-20 text-center text-[10px] font-bold text-slate-600">{formatNumber(currentPage)} / {formatNumber(pageCount)}</span><button type="button" aria-label="الصفحة التالية" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30"><ChevronLeft size={14} /></button></div></div>}
    </div>
  );
}
