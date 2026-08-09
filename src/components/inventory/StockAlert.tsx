import Badge from "../common/Badge";

const products = [
  {
    name: "Headphones",
    stock: 5,
  },
  {
    name: "Keyboard",
    stock: 3,
  },
];

export default function StockAlert() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <h3 className="text-lg font-bold">
        تنبيهات المخزون
      </h3>

      <div className="mt-5 space-y-3">
        {products.map((product) => (
          <div
            key={product.name}
            className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
          >
            <span>
              {product.name}
            </span>

            <Badge variant="warning">
              {product.stock} متبقي
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}