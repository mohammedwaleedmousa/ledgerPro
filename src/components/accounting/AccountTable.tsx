import Badge from "../common/Badge";
import Table from "../common/Table";

const accounts = [
  {
    name: "الصندوق",
    type: "أصل",
    balance: "$50,000",
  },
  {
    name: "البنك",
    type: "أصل",
    balance: "$120,000",
  },
  {
    name: "المبيعات",
    type: "إيراد",
    balance: "$250,000",
  },
];

export default function AccountTable() {
  return (
    <Table>
      <thead className="border-b bg-gray-50">
        <tr>
          <th className="p-5 text-sm text-gray-500">
            الحساب
          </th>

          <th className="p-5 text-sm text-gray-500">
            النوع
          </th>

          <th className="p-5 text-sm text-gray-500">
            الرصيد
          </th>
        </tr>
      </thead>

      <tbody>
        {accounts.map((account) => (
          <tr key={account.name} className="border-b last:border-none">
            <td className="p-5 font-medium">
              {account.name}
            </td>

            <td className="p-5">
              <Badge>
                {account.type}
              </Badge>
            </td>

            <td className="p-5 font-semibold">
              {account.balance}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}