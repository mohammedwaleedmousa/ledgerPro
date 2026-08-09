import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";
import { appPaths } from "../../routes/navigation";
import Badge from "../common/Badge";
import Table from "../common/Table";

type Props = {
  search: string;
  categoryId: string;
};

export default function ProductTable({ search, categoryId }: Props) {
  const navigate = useNavigate();
  const { products, categories, removeProduct } = useErp();
  const [error, setError] = useState<string | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesSearch = !normalizedSearch || product.name.toLowerCase().includes(normalizedSearch) || product.sku.toLowerCase().includes(normalizedSearch);
    return matchesSearch && (!categoryId || product.categoryId === categoryId);
  });

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`هل تريد حذف المنتج «${name}»؟`)) return;
    try {
      removeProduct(id);
      setError(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "تعذر حذف المنتج.");
    }
  }

  return (
    <div className="space-y-3">
      {error && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <Table>
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="p-5 text-sm text-gray-500">المنتج</th>
            <th className="p-5 text-sm text-gray-500">SKU</th>
            <th className="p-5 text-sm text-gray-500">التصنيف</th>
            <th className="p-5 text-sm text-gray-500">التكلفة</th>
            <th className="p-5 text-sm text-gray-500">السعر</th>
            <th className="p-5 text-sm text-gray-500">المخزون</th>
            <th className="p-5 text-sm text-gray-500">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id} className="border-b last:border-none">
              <td className="p-5 font-medium">{product.name}</td>
              <td className="p-5 font-mono text-sm text-gray-500">{product.sku}</td>
              <td className="p-5 text-gray-500">{categories.find((category) => category.id === product.categoryId)?.name ?? "بدون تصنيف"}</td>
              <td className="p-5 text-gray-600">{formatCurrency(product.cost)}</td>
              <td className="p-5 font-semibold">{formatCurrency(product.price)}</td>
              <td className="p-5"><Badge variant={product.stock <= product.lowStockThreshold ? "warning" : "success"}>{formatNumber(product.stock)} {product.stock <= product.lowStockThreshold ? "منخفض" : "متوفر"}</Badge></td>
              <td className="p-5">
                <div className="flex items-center gap-2">
                  <button type="button" aria-label={`تعديل ${product.name}`} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" onClick={() => navigate(appPaths.editProduct(product.id))}><Pencil size={17} /></button>
                  <button type="button" aria-label={`حذف ${product.name}`} className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => handleDelete(product.id, product.name)}><Trash2 size={17} /></button>
                </div>
              </td>
            </tr>
          ))}
          {filteredProducts.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-gray-400">لا توجد منتجات مطابقة.</td></tr>}
        </tbody>
      </Table>
    </div>
  );
}
