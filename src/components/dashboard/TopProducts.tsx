import { Link } from "react-router-dom";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";
import { appPaths } from "../../routes/navigation";

export default function TopProducts() {
  const { products, invoices } = useErp();
  const topProducts = products.map((product) => {
    const items = invoices.flatMap((invoice) => invoice.items).filter((item) => item.productId === product.id);
    return { id: product.id, name: product.name, sales: items.reduce((sum, item) => sum + item.quantity, 0), revenue: items.reduce((sum, item) => sum + item.total, 0) };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <div className="mb-5 flex items-center justify-between"><h3 className="text-lg font-bold text-gray-900">أفضل المنتجات</h3><Link to={appPaths.products} className="text-sm text-blue-600">عرض المنتجات</Link></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {topProducts.map((product) => <div key={product.id} className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4"><div className="min-w-0"><p className="truncate font-medium text-gray-900">{product.name}</p><p className="mt-1 text-sm text-gray-400">{formatNumber(product.sales)} وحدة مباعة</p></div><span className="shrink-0 font-semibold text-blue-600">{formatCurrency(product.revenue)}</span></div>)}
      </div>
    </div>
  );
}
