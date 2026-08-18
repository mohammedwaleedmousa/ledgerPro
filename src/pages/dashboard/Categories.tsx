import { FolderPlus, Layers3, Package, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { useAuth } from "../../context/AuthContext";
import { useErp } from "../../context/ErpContext";
import { apiRequest } from "../../lib/api";
import { formatDate, formatNumber } from "../../lib/format";
import type { Category, Product } from "../../types/erp";

type PageResult<T>={items:T[];page:number;limit:number;total:number};

export default function Categories(){
  const {user}=useAuth(); const erp=useErp(); const isProduction=user?.mode==="supabase";
  const [productionCategories,setProductionCategories]=useState<Category[]>([]),[productionProducts,setProductionProducts]=useState<Product[]>([]);
  const categories=isProduction?productionCategories:erp.categories, products=isProduction?productionProducts:erp.products;
  const [name,setName]=useState(""),[description,setDescription]=useState(""),[showForm,setShowForm]=useState(false),[message,setMessage]=useState<string|null>(null),[error,setError]=useState<string|null>(null),[loading,setLoading]=useState(isProduction),[saving,setSaving]=useState(false);
  const usedCategoryIds=new Set(products.map(p=>p.categoryId));

  async function loadProduction(){if(!isProduction)return;setLoading(true);try{const [cats,productPage]=await Promise.all([apiRequest<Category[]>("/system/categories"),apiRequest<PageResult<Product>>("/erp/products?limit=100&page=1")]);setProductionCategories(cats);setProductionProducts(productPage.items);setError(null);}catch(e){setError(e instanceof Error?e.message:"تعذر تحميل التصنيفات.");}finally{setLoading(false);}}
  useEffect(()=>{void loadProduction();},[isProduction]);

  async function handleSubmit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setSaving(true);try{if(isProduction){await apiRequest("/system/categories",{method:"POST",body:JSON.stringify({name,description})});await loadProduction();}else erp.addCategory(name,description);setName("");setDescription("");setError(null);setMessage("تمت إضافة التصنيف.");}catch(e){setMessage(null);setError(e instanceof Error?e.message:"تعذر إضافة التصنيف.");}finally{setSaving(false);}}
  async function handleDelete(id:string,categoryName:string){if(!window.confirm(`هل تريد تعطيل تصنيف «${categoryName}»؟`))return;try{if(isProduction){await apiRequest(`/system/categories/${id}`,{method:"DELETE"});await loadProduction();}else erp.removeCategory(id);setError(null);}catch(e){setError(e instanceof Error?e.message:"تعذر تعطيل التصنيف.");}}

  return <div className="space-y-4"><PageHeader title="التصنيفات" description="تنظيم كتالوج المنتجات ضمن مجموعات واضحة وسهلة التصفية." eyebrow="المنتجات" actions={<Button onClick={()=>setShowForm(c=>!c)}><FolderPlus size={14}/>{showForm?"إغلاق":"إضافة تصنيف"}</Button>}/><div className="grid gap-3 md:grid-cols-3"><StatCard title="إجمالي التصنيفات" value={formatNumber(categories.filter(c=>c.isActive).length)} icon={Layers3}/><StatCard title="التصنيفات المستخدمة" value={formatNumber(categories.filter(c=>c.isActive&&usedCategoryIds.has(c.id)).length)} icon={Package} tone="emerald"/><StatCard title="إجمالي المنتجات" value={formatNumber(products.length)} icon={Package} tone="slate"/></div>{showForm&&<form onSubmit={handleSubmit}><Card>{error&&<div className="mb-4 rounded-xl bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}{message&&<div className="mb-4 rounded-xl bg-emerald-50 p-3 text-[11px] text-emerald-700">{message}</div>}<div className="grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end"><Input label="اسم التصنيف" value={name} onChange={e=>setName(e.target.value)} required/><Input label="الوصف" value={description} onChange={e=>setDescription(e.target.value)}/><Button type="submit" loading={saving}>حفظ التصنيف</Button></div></Card></form>}{error&&!showForm&&<div className="rounded-xl bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}{loading?<Card className="py-12 text-center text-xs text-slate-400">جارٍ تحميل التصنيفات...</Card>:<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{categories.filter(c=>c.isActive).map(category=>{const productCount=products.filter(p=>p.categoryId===category.id).length;return <Card key={category.id}><div className="flex items-start justify-between gap-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Layers3 size={16}/></span><button type="button" aria-label={`تعطيل ${category.name}`} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50" onClick={()=>void handleDelete(category.id,category.name)}><Trash2 size={14}/></button></div><h2 className="mt-4 text-xs font-black text-slate-900">{category.name}</h2><p className="mt-2 min-h-10 text-[10px] leading-5 text-slate-500">{category.description||"بدون وصف"}</p><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[9px]"><span className="font-bold text-blue-600">{formatNumber(productCount)} منتجات</span><span className="text-slate-400">{formatDate(category.createdAt)}</span></div></Card>})}{categories.filter(c=>c.isActive).length===0&&<Card className="col-span-full py-12 text-center text-xs text-slate-400">لا توجد تصنيفات.</Card>}</div>}</div>;
}
