const products = [
  { name: "Laptop Pro", sales: "2300", revenue: "$124,000" },
  { name: "Smart Phone", sales: "1800", revenue: "$92,000" },
  { name: "Headphones", sales: "950", revenue: "$45,000" },
];

export default function TopProducts() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">أفضل المنتجات</h3>
        <button className="text-sm text-blue-600">عرض الكل</button>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.name} className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-400">{product.sales} مبيعات</p>
            </div>

            <span className="font-semibold text-blue-600">
              {product.revenue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}