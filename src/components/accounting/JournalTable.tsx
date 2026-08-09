import Table from "../common/Table";
import Badge from "../common/Badge";

const entries = [
  {
    id: "JE-001",
    description: "شراء مخزون",
    debit: "$5,000",
    credit: "$5,000",
    status: "متوازن",
  },
  {
    id: "JE-002",
    description: "فاتورة بيع",
    debit: "$2,500",
    credit: "$2,500",
    status: "متوازن",
  },
];

export default function JournalTable() {
  return (
    <Table>
      <thead className="border-b bg-gray-50">
        <tr>
          <th className="p-5 text-sm text-gray-500">
            الرقم
          </th>

          <th className="p-5 text-sm text-gray-500">
            الوصف
          </th>

          <th className="p-5 text-sm text-gray-500">
            مدين
          </th>

          <th className="p-5 text-sm text-gray-500">
            دائن
          </th>

          <th className="p-5 text-sm text-gray-500">
            الحالة
          </th>
        </tr>
      </thead>

      <tbody>
        {entries.map((entry) => (
          <tr key={entry.id} className="border-b last:border-none">
            <td className="p-5 font-medium">
              {entry.id}
            </td>

            <td className="p-5 text-gray-600">
              {entry.description}
            </td>

            <td className="p-5 font-semibold">
              {entry.debit}
            </td>

            <td className="p-5 font-semibold">
              {entry.credit}
            </td>

            <td className="p-5">
              <Badge>
                {entry.status}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}