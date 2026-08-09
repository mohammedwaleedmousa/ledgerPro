const transactions = [
  { name: "فاتورة #102", amount: "$5,000", status: "مدفوعة" },
  { name: "شراء مخزون", amount: "$1,200", status: "مكتملة" },
  { name: "دفعة عميل", amount: "$2,500", status: "معلقة" },
];

export default function Transactions() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">آخر العمليات</h3>
        <button className="text-sm text-blue-600">عرض الكل</button>
      </div>

      <div className="space-y-4">
        {transactions.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <span className="text-gray-700">{item.name}</span>
            <span className="font-medium text-gray-900">{item.amount}</span>
            <span className="text-sm text-green-600">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}