const invoices = [
  {
    id: "INV-001",
    customer: "شركة التقنية",
    amount: "$5,000",
    status: "مدفوع",
  },
  {
    id: "INV-002",
    customer: "متجر المستقبل",
    amount: "$2,300",
    status: "معلق",
  },
  {
    id: "INV-003",
    customer: "شركة البناء",
    amount: "$8,900",
    status: "مدفوع",
  },
];

export default function InvoiceTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
      <table className="w-full text-right">

        <thead className="border-b bg-gray-50">
          <tr>
            <th className="p-5 text-sm font-medium text-gray-500">
              الرقم
            </th>

            <th className="p-5 text-sm font-medium text-gray-500">
              العميل
            </th>

            <th className="p-5 text-sm font-medium text-gray-500">
              المبلغ
            </th>

            <th className="p-5 text-sm font-medium text-gray-500">
              الحالة
            </th>
          </tr>
        </thead>


        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b last:border-none">

              <td className="p-5 font-medium">
                {invoice.id}
              </td>

              <td className="p-5 text-gray-600">
                {invoice.customer}
              </td>

              <td className="p-5 font-semibold">
                {invoice.amount}
              </td>

              <td className="p-5">
                <span className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-600">
                  {invoice.status}
                </span>
              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}