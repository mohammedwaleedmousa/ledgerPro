import { FolderPlus, Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useErp } from "../../context/ErpContext";
import { formatDate, formatNumber } from "../../lib/format";

export default function Categories() {
  const { categories, products, addCategory, removeCategory } = useErp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    try {
      removeCategory(id);
      setError(null);
    } catch (categoryError) {
      setError(categoryError instanceof Error ? categoryError.message : "تعذر حذف التصنيف.");
    }
  }

  return (
    <div className="space-y-6">
      <header><h1 className="text-3xl font-bold text-gray-900">التصنيفات</h1><p className="mt-2 text-gray-500">تنظيم المنتجات داخل تصنيفات واضحة</p></header>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-100 bg-white p-6">
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><FolderPlus size={21} /></span><div><h2 className="font-bold">إضافة تصنيف</h2><p className="mt-1 text-sm text-gray-400">يمكن استخدامه مباشرة عند إنشاء المنتج</p></div></div>
        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end"><Input label="اسم التصنيف" value={name} onChange={(event) => setName(event.target.value)} placeholder="مثال: أجهزة" required /><Input label="الوصف" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="وصف مختصر" /><Button type="submit">إضافة</Button></div>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const productCount = products.filter((product) => product.categoryId === category.id).length;
          return <article key={category.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="font-bold text-gray-900">{category.name}</h2><p className="mt-2 min-h-10 text-sm leading-6 text-gray-500">{category.description || "بدون وصف"}</p></div><button type="button" aria-label={`حذف ${category.name}`} className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => handleDelete(category.id, category.name)}><Trash2 size={17} /></button></div><div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-sm"><span className="font-medium text-blue-600">{formatNumber(productCount)} منتجات</span><span className="text-gray-400">{formatDate(category.createdAt)}</span></div></article>;
        })}
      </div>
    </div>
  );
}
