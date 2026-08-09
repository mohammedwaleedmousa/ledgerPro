import Badge from "../common/Badge";
import Table from "../common/Table";

const customers = [
  {
    name: "شركة التقنية",
    phone: "777123456",
    balance: "$5,000",
    status: "نشط",
  },
  {
    name: "متجر المستقبل",
    phone: "777654321",
    balance: "$1,200",
    status: "نشط",
  },
  {
    name: "شركة البناء",
    phone: "777987654",
    balance: "$0",
    status: "مغلق",
  },
];

export default function CustomerTable() {
  return (
    <Table>
      <thead className="border-b bg-gray-50">
        <tr>
          <th className="p-5 text-sm text-gray-500">
            العميل
          </th>

          <th className="p-5 text-sm text-gray-500">
            الهاتف
          </th>

          <th className="p-5 text-sm text-gray-500">
            الرصيد
          </th>

          <th className="p-5 text-sm text-gray-500">
            الحالة
          </th>
        </tr>
      </thead>

      <tbody>
        {customers.map((customer) => (
          <tr key={customer.name} className="border-b last:border-none">
            <td className="p-5 font-medium">
              {customer.name}
            </td>

            <td className="p-5 text-gray-500">
              {customer.phone}
            </td>

            <td className="p-5 font-semibold">
              {customer.balance}
            </td>

            <td className="p-5">
              <Badge>
                {customer.status}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}