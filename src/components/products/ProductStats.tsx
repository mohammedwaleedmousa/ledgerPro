import { Boxes, CircleDollarSign, TriangleAlert } from "lucide-react";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";
import StatCard from "../common/StatCard";

export default function ProductStats() {
  const { products } = useErp();
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <StatCard title="إجمالي المنتجات" value={formatNumber(products.length)} icon={Boxes} />
      <StatCard title="قيمة المخزون" value={formatCurrency(products.reduce((sum, product) => sum + product.cost * product.stock, 0))} icon={CircleDollarSign} tone="emerald" />
      <StatCard title="مخزون منخفض" value={formatNumber(products.filter((product) => product.stock <= product.lowStockThreshold).length)} icon={TriangleAlert} tone="amber" />
    </div>
  );
}
