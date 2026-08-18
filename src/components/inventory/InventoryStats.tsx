import { Activity, Boxes, CircleDollarSign, TriangleAlert } from "lucide-react";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";
import type { Product, StockMovement } from "../../types/erp";
import StatCard from "../common/StatCard";

export default function InventoryStats({ products: suppliedProducts, movements: suppliedMovements }: { products?: Product[]; movements?: StockMovement[] }) {
  const erp = useErp();
  const products = suppliedProducts ?? erp.products;
  const stockMovements = suppliedMovements ?? erp.stockMovements;
  const today = new Date().toISOString().slice(0, 10);
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard title="إجمالي الوحدات" value={formatNumber(products.reduce((sum, product) => sum + product.stock, 0))} icon={Boxes} /><StatCard title="قيمة المخزون" value={formatCurrency(products.reduce((sum, product) => sum + product.cost * product.stock, 0))} icon={CircleDollarSign} tone="emerald" /><StatCard title="منتجات منخفضة" value={formatNumber(products.filter((product) => product.stock <= product.lowStockThreshold).length)} icon={TriangleAlert} tone="amber" /><StatCard title="حركات اليوم" value={formatNumber(stockMovements.filter((movement) => movement.date.startsWith(today)).length)} icon={Activity} tone="slate" /></div>;
}
