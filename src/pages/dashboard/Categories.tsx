import { FolderPlus, Layers3, Package, Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { useErp } from "../../context/ErpContext";
import { formatDate, formatNumber } from "../../lib/format";

export default function Categories() {
  const { categories, products, addCategory, removeCategory } = useErp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const usedCategoryIds = new Set(products.map((product) => product.categoryId));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      addCategory(name, description);
      setName("");
      setDescription("");
      setError(null);
      setMessage("تمت إضافة التصنيف.");
    } catch (categoryError) {
      setMessage(null);
      setError(categoryError instanceof Error ? categoryError.message : "تعذر إضافة التصنيف.");
    }
  }

  function handleDelete(id: string, categoryName: string) {
    if (!window.confirm(`هل تريد حذف تصنيف «${categoryName}»؟`)) return;
    try { removeCategory(id); setError(null); } catch (categoryError) { setError(categoryError instanceof Error ? categoryError.message : "تعذر حذف التصنيف."); }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="التصنيفات" description="تنظيم كتالوج المنتجات ضمن مجموعات واضحة وسهلة التصفية." eyebrow="المنتجات" actions={<Button onClick={() => setShowForm((current) => !current)}><FolderPlus size={14} />{showForm ? "إغلاق" : "إضافة تصنيف"}</Button>} />
      <div className="grid gap-3 md:grid-cols-3"><StatCard title="إجمالي التصنيفات" value={formatNumber(categories.length)} icon={Layers3} /><StatCard title="التصنيفات المستخدمة" value={formatNumber(categories.filter((category) => usedCategoryIds.has(category.id)).length)} icon={Package} tone="emerald" /><StatCard title="إجمالي المنتجات" value={formatNumber(products.length)} icon={Package} tone="slate" /></div>

      {showForm && <form onSubmit={handleSubmit}><Card>{error && <div className="mb-4 rounded-xl bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}{message && <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-[11px] text-emerald-700">{message}</div>}<div className="grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end"><Input label="اسم التصنيف" value={name} onChange={(event) => setName(event.target.value)} placeholder="مثال: أجهزة" required /><Input label="الوصف" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="وصف مختصر" /><Button type="submit">حفظ التصنيف</Button></div></Card></form>}

      {error && !showForm && <div className="rounded-xl bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{categories.map((category) => {
        const productCount = products.filter((product) => product.categoryId === category.id).length;
        return <Card key={category.id}><div className="flex items-start justify-between gap-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Layers3 size={16} /></span><button type="button" aria-label={`حذف ${category.name}`} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50" onClick={() => handleDelete(category.id, category.name)}><Trash2 size={14} /></button></div><h2 className="mt-4 text-xs font-black text-slate-900">{category.name}</h2><p className="mt-2 min-h-10 text-[10px] leading-5 text-slate-500">{category.description || "بدون وصف"}</p><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[9px]"><span className="font-bold text-blue-600">{formatNumber(productCount)} منتجات</span><span className="text-slate-400">{formatDate(category.createdAt)}</span></div></Card>;
      })}{categories.length === 0 && <Card className="col-span-full py-12 text-center text-xs text-slate-400">لا توجد تصنيفات.</Card>}</div>
    </div>
  );
}
