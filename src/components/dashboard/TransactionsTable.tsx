const transactions = [
  { name: "فاتورة #102", amount: "$5000", status: "مدفوعة" },
  { name: "مصروف مكتب", amount: "$250", status: "خصم" },
  { name: "دفعة عميل", amount: "$2200", status: "معلقة" },
];

export default function TransactionsTable() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-semibold mb-5">
        آخر العمليات
      </h3>

      <div className="space-y-4">
        {transactions.map((item) => (
          <div key={item.name} className="flex justify-between text-sm">
            <span>{item.name}</span>
            <span>{item.amount}</span>
            <span className="text-green-600">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}