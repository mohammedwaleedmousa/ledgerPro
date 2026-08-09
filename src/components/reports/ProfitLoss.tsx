const data = [
  {
    name: "المبيعات",
    amount: "$245,000",
  },
  {
    name: "تكلفة المنتجات",
    amount: "$70,000",
  },
  {
    name: "المصاريف",
    amount: "$12,000",
  },
  {
    name: "الربح الصافي",
    amount: "$163,000",
  },
];

export default function ProfitLoss() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <h3 className="text-lg font-bold text-gray-900">
        الأرباح والخسائر
      </h3>

      <div className="mt-6 space-y-4">
        {data.map((item) => (
          <div key={item.name} className="flex justify-between rounded-xl bg-gray-50 p-4">
            <span>
              {item.name}
            </span>

            <span className="font-semibold">
              {item.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}