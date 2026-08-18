import { useEffect, useState } from "react";
import ProductHeader from "../../components/products/ProductHeader";
import ProductStats from "../../components/products/ProductStats";
import ProductTable from "../../components/products/ProductTable";
import { useAuth } from "../../context/AuthContext";
import { useErp } from "../../context/ErpContext";
import { apiRequest } from "../../lib/api";
import type { Category, Product } from "../../types/erp";

type PageResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

type BootstrapResult = {
  categories: Category[];
};

export default function Products() {
  const { user } = useAuth();
  const erp = useErp();
  const isProductionMode = user?.mode === "supabase";
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productionProducts, setProductionProducts] = useState<Product[]>([]);
  const [productionCategories, setProductionCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isProductionMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isProductionMode) return;
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const [bootstrap, products] = await Promise.all([
          apiRequest<BootstrapResult>("/erp/bootstrap"),
          apiRequest<PageResult<Product>>("/erp/products?limit=100&page=1"),
        ]);
        if (!active) return;
        setProductionCategories(bootstrap.categories);
        setProductionProducts(products.items);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "تعذر تحميل المنتجات من الخادم.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProducts();
    return () => {
      active = false;
    };
  }, [isProductionMode]);

  const categories = isProductionMode ? productionCategories : erp.categories;

  return (
    <div className="space-y-4">
      <ProductHeader search={search} categoryId={categoryId} categories={categories} onSearchChange={setSearch} onCategoryChange={setCategoryId} />

      {isProductionMode && <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-[11px] font-medium text-emerald-800">المنتجات والمخزون المعروضان هنا محمّلان من قاعدة بيانات الشركة. التعديل والحذف المحليان معطلان حتى اكتمال CRUD الخادم.</div>}
      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-500">جارٍ تحميل المنتجات من الخادم...</div>
      ) : (
        <>
          <ProductStats products={isProductionMode ? productionProducts : undefined} />
          <ProductTable search={search} categoryId={categoryId} products={isProductionMode ? productionProducts : undefined} categories={isProductionMode ? productionCategories : undefined} readOnlyActions={isProductionMode} />
        </>
      )}
    </div>
  );
}
