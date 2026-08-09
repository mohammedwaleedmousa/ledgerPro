import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";
import Card from "../common/Card";

export default function ProductStats() {
  const { products } = useErp();
  const stats = [
    { title: "إجمالي المنتجات", value: formatNumber(products.length) },
    { title: "قيمة المخزون", value: formatCurrency(products.reduce((sum, product) => sum + product.cost * product.stock, 0)) },
    { title: "مخزون منخفض", value: formatNumber(products.filter((product) => product.stock <= product.lowStockThreshold).length) },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {stats.map((item) => (
        <Card key={item.title}>
          <p className="text-sm text-gray-400">{item.title}</p>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">{item.value}</h2>
        </Card>
      ))}
    </div>
  );
}
