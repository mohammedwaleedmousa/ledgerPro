const stats = [
  {
    title: "إجمالي الفواتير",
    value: "1,248",
  },
  {
    title: "الفواتير المدفوعة",
    value: "986",
  },
  {
    title: "المبالغ المستحقة",
    value: "$24,500",
  },
];

export default function InvoiceStats() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {stats.map((item) => (
        <div key={item.title} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-400">
            {item.title}
          </p>

          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            {item.value}
          </h2>
        </div>
      ))}
    </div>
  );
}