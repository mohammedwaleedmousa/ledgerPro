import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useErp } from "../../context/ErpContext";
import { appPaths } from "../../routes/navigation";
import Button from "../common/Button";
import Card from "../common/Card";
import Input from "../common/Input";
import ProductImageUpload from "./ProductImageUpload";

export default function ProductForm() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { products, categories, addProduct, updateProduct } = useErp();
  const existing = products.find((product) => product.id === productId);
  const [name, setName] = useState(existing?.name ?? "");
  const [sku, setSku] = useState(existing?.sku ?? "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? categories[0]?.id ?? "");
  const [cost, setCost] = useState(String(existing?.cost ?? ""));
  const [price, setPrice] = useState(String(existing?.price ?? ""));
  const [stock, setStock] = useState(String(existing?.stock ?? ""));
  const [lowStockThreshold, setLowStockThreshold] = useState(String(existing?.lowStockThreshold ?? 5));
  const [description, setDescription] = useState(existing?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const input = {
        name,
        sku,
        categoryId,
        cost: Number(cost),
        price: Number(price),
        stock: Number(stock),
        lowStockThreshold: Number(lowStockThreshold),
        description,
        isActive: true,
      };
      if (existing) updateProduct(existing.id, input);
      else addProduct(input);
      navigate(appPaths.products, { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ المنتج.");
      setSaving(false);
    }
  }

  return (
    <form className="grid grid-cols-1 gap-4 xl:grid-cols-3" onSubmit={handleSubmit}>
      <div className="xl:col-span-2">
        <Card>
          <h2 className="text-sm font-black text-slate-900">معلومات المنتج</h2>
          <p className="mt-1 text-[10px] text-slate-400">الحقول الأساسية المستخدمة في البيع والمخزون.</p>
          {error && <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="اسم المنتج" placeholder="مثال: Laptop Pro" value={name} onChange={(event) => setName(event.target.value)} required />
            <Input label="SKU" placeholder="LP-001" value={sku} onChange={(event) => setSku(event.target.value)} required />
            <Input label="سعر البيع" type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
            <Input label="سعر التكلفة" type="number" min="0" step="0.01" value={cost} onChange={(event) => setCost(event.target.value)} required />
            <Input label="الكمية الحالية" type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} required />
            <Input label="حد تنبيه المخزون" type="number" min="0" step="1" value={lowStockThreshold} onChange={(event) => setLowStockThreshold(event.target.value)} required />
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="product-category" className="block text-[11px] font-bold text-slate-600">التصنيف</label>
              <select id="product-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" required>
                <option value="" disabled>اختر التصنيف</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2"><Input label="وصف المنتج" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="وصف مختصر..." /></div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>{existing ? "حفظ التعديلات" : "حفظ المنتج"}</Button>
            <Button variant="secondary" onClick={() => navigate(appPaths.products)}>إلغاء</Button>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <ProductImageUpload />
        <p className="px-2 text-[10px] leading-5 text-slate-400">رفع الصور سيُربط بـSupabase Storage عند تفعيل طبقة البيانات الإنتاجية. بقية بيانات المنتج تعمل الآن.</p>
      </div>
    </form>
  );
}
