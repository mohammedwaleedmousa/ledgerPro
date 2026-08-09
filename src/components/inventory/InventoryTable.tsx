import Badge from "../common/Badge";
import Table from "../common/Table";

const movements = [
  {
    product: "Laptop Pro",
    type: "إضافة",
    quantity: "+50",
    date: "اليوم",
  },
  {
    product: "Smart Phone",
    type: "بيع",
    quantity: "-10",
    date: "اليوم",
  },
];

export default function InventoryTable() {
  return (
    <Table>
      <thead className="border-b bg-gray-50">
        <tr>
          <th className="p-5 text-sm text-gray-500">
            المنتج
          </th>

          <th className="p-5 text-sm text-gray-500">
            الحركة
          </th>

          <th className="p-5 text-sm text-gray-500">
            الكمية
          </th>

          <th className="p-5 text-sm text-gray-500">
            التاريخ
          </th>
        </tr>
      </thead>

      <tbody>
        {movements.map((item) => (
          <tr key={item.product} className="border-b last:border-none">
            <td className="p-5 font-medium">
              {item.product}
            </td>

            <td className="p-5">
              <Badge>
                {item.type}
              </Badge>
            </td>

            <td className="p-5 font-semibold">
              {item.quantity}
            </td>

            <td className="p-5 text-gray-500">
              {item.date}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}