import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";
import Card from "../common/Card";

export default function InventoryStats() {
  const { products, stockMovements } = useErp();
  const today = new Date().toISOString().slice(0, 10);
  const stats = [
    { title: "إجمالي الوحدات", value: formatNumber(products.reduce((sum, product) => sum + product.stock, 0)) },
    { title: "قيمة المخزون", value: formatCurrency(products.reduce((sum, product) => sum + product.cost * product.stock, 0)) },
    { title: "منتجات منخفضة", value: formatNumber(products.filter((product) => product.stock <= product.lowStockThreshold).length) },
    { title: "حركات اليوم", value: formatNumber(stockMovements.filter((movement) => movement.date.startsWith(today)).length) },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => <Card key={item.title}><p className="text-sm text-gray-400">{item.title}</p><h2 className="mt-4 text-3xl font-bold">{item.value}</h2></Card>)}
    </div>
  );
}
