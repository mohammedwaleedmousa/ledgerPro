import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { appPaths } from "../../routes/navigation";
import type { Category } from "../../types/erp";
import Button from "../common/Button";
import Card from "../common/Card";
import PageHeader from "../common/PageHeader";

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
    <>
      <PageHeader title="المنتجات" description="إدارة كتالوج المنتجات والأسعار ومستويات إعادة الطلب." eyebrow="المنتجات" actions={<Button onClick={() => navigate(appPaths.createProduct)}><Plus size={15} />إضافة منتج</Button>} />
      <Card className="mt-4 p-3 sm:p-4"><div className="grid gap-3 md:grid-cols-[1fr_220px]"><label className="flex min-h-10 items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3"><Search size={15} className="text-slate-400" /><span className="sr-only">البحث عن منتج</span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="الاسم أو SKU..." className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label><select aria-label="تصفية حسب التصنيف" value={categoryId} onChange={(event) => onCategoryChange(event.target.value)} className="min-h-10 rounded-[10px] border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-blue-500"><option value="">كل التصنيفات</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div></Card>
    </>
  );
}
