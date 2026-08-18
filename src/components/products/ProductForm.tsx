import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useErp } from "../../context/ErpContext";
import { apiRequest } from "../../lib/api";
import { appPaths } from "../../routes/navigation";
import type { Category, Product } from "../../types/erp";
import Button from "../common/Button";
import Card from "../common/Card";
import Input from "../common/Input";
import ProductImageUpload from "./ProductImageUpload";

type BootstrapResult = { categories: Category[] };

export default function ProductForm() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { user } = useAuth();
  const erp = useErp();
  const isProduction = user?.mode === "supabase";
  const localExisting = erp.products.find((product) => product.id === productId);
  const [existing, setExisting] = useState<Product | undefined>(isProduction ? undefined : localExisting);
  const [categories, setCategories] = useState<Category[]>(isProduction ? [] : erp.categories);
  const [name, setName] = useState(localExisting?.name ?? "");
  const [sku, setSku] = useState(localExisting?.sku ?? "");
  const [categoryId, setCategoryId] = useState(localExisting?.categoryId ?? erp.categories[0]?.id ?? "");
  const [cost, setCost] = useState(String(localExisting?.cost ?? ""));
  const [price, setPrice] = useState(String(localExisting?.price ?? ""));
  const [stock, setStock] = useState(String(localExisting?.stock ?? ""));
  const [lowStockThreshold, setLowStockThreshold] = useState(String(localExisting?.lowStockThreshold ?? 5));
  const [description, setDescription] = useState(localExisting?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isProduction);

  useEffect(() => {
    if (!isProduction) return;
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [bootstrap, product] = await Promise.all([
          apiRequest<BootstrapResult>("/erp/bootstrap"),
          productId ? apiRequest<Product | null>(`/erp/products/${productId}`) : Promise.resolve(null),
        ]);
        if (!active) return;
        setCategories(bootstrap.categories);
        if (product) {
          setExisting(product);
          setName(product.name);
          setSku(product.sku);
          setCategoryId(product.categoryId);
          setCost(String(product.cost));
          setPrice(String(product.price));
          setStock(String(product.stock));
          setLowStockThreshold(String(product.lowStockThreshold));
          setDescription(product.description);
        } else if (!productId) {
          setCategoryId(bootstrap.categories[0]?.id ?? "");
        } else {
          setError("المنتج غير موجود أو لا ينتمي إلى شركتك.");
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "تعذر تحميل بيانات المنتج.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [isProduction, productId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const input = {
        name: name.trim(),
        sku: sku.trim(),
        categoryId,
        cost: Number(cost),
        price: Number(price),
        stock: Number(stock || 0),
        lowStockThreshold: Number(lowStockThreshold),
        description: description.trim(),
        isActive: existing?.isActive ?? true,
      };

      if (isProduction) {
        if (existing) await apiRequest(`/products/${existing.id}`, { method: "PATCH", body: JSON.stringify(input) });
        else await apiRequest("/products", { method: "POST", body: JSON.stringify(input) });
      } else if (existing) {
        erp.updateProduct(existing.id, input);
      } else {
        erp.addProduct(input);
      }

      navigate(appPaths.products, { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ المنتج.");
      setSaving(false);
    }
  }

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-500">جارٍ تحميل بيانات المنتج...</div>;

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
            <Input label={existing && isProduction ? "الكمية الحالية (تُعدل من المخزون)" : "الكمية الافتتاحية"} type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} disabled={Boolean(existing && isProduction)} required />
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

          {existing && isProduction && <p className="mt-3 text-[10px] leading-5 text-amber-700">تعديل الكمية الحالية يتم من شاشة المخزون حتى تُسجل حركة المخزون والقيد المحاسبي بشكل صحيح.</p>}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>{existing ? "حفظ التعديلات" : "حفظ المنتج"}</Button>
            <Button variant="secondary" onClick={() => navigate(appPaths.products)}>إلغاء</Button>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <ProductImageUpload />
        <p className="px-2 text-[10px] leading-5 text-slate-400">رفع الصور سيُربط بـSupabase Storage في مرحلة مستقلة؛ بيانات المنتج الأساسية أصبحت مرتبطة بمسار الإنتاج.</p>
      </div>
    </form>
  );
}
