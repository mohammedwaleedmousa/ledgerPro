import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../types/erp";
import { appPaths } from "../../routes/navigation";
import Button from "../common/Button";

type Props = {
  search: string;
  categoryId: string;
  categories: Category[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

export default function ProductHeader({ search, categoryId, categories, onSearchChange, onCategoryChange }: Props) {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المنتجات</h1>
          <p className="mt-2 text-gray-500">إدارة المنتجات والمخزون والأسعار</p>
        </div>

        <Button onClick={() => navigate(appPaths.createProduct)}>
          <span className="flex items-center gap-2"><Plus size={18} />إضافة منتج</span>
        </Button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <span className="sr-only">البحث عن منتج</span>
          <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="الاسم أو SKU..." className="w-full bg-transparent outline-none" />
        </label>

        <select aria-label="تصفية حسب التصنيف" value={categoryId} onChange={(event) => onCategoryChange(event.target.value)} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 outline-none focus:border-blue-500">
          <option value="">كل التصنيفات</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </div>
    </div>
  );
}
