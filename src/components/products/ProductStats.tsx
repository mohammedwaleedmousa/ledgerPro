import Card from "../common/Card";

const stats = [
  { title: "إجمالي المنتجات", value: "10,245" },
  { title: "قيمة المخزون", value: "$245,000" },
  { title: "مخزون منخفض", value: "24" },
];

export default function ProductStats() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {stats.map((item) => (
        <Card key={item.title}>
          <p className="text-sm text-gray-400">
            {item.title}
          </p>

          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            {item.value}
          </h2>
        </Card>
      ))}
    </div>
  );
}