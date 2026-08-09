import Badge from "../common/Badge";
import Table from "../common/Table";

const products = [
  {
    name: "Laptop Pro",
    category: "أجهزة",
    price: "$1200",
    stock: 45,
  },
  {
    name: "Smart Phone",
    category: "هواتف",
    price: "$800",
    stock: 20,
  },
  {
    name: "Headphones",
    category: "إكسسوارات",
    price: "$150",
    stock: 5,
  },
];

export default function ProductTable() {
  return (
    <Table>
      <thead className="border-b bg-gray-50">
        <tr>
          <th className="p-5 text-sm text-gray-500">
            المنتج
          </th>

          <th className="p-5 text-sm text-gray-500">
            التصنيف
          </th>

          <th className="p-5 text-sm text-gray-500">
            السعر
          </th>

          <th className="p-5 text-sm text-gray-500">
            المخزون
          </th>
        </tr>
      </thead>

      <tbody>
        {products.map((product) => (
          <tr key={product.name} className="border-b last:border-none">
            <td className="p-5 font-medium">
              {product.name}
            </td>

            <td className="p-5 text-gray-500">
              {product.category}
            </td>

            <td className="p-5 font-semibold">
              {product.price}
            </td>

            <td className="p-5">
              {product.stock <= 5 ? (
                <Badge variant="warning">
                  منخفض
                </Badge>
              ) : (
                <Badge>
                  متوفر
                </Badge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}