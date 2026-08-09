import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";

export default function InvoiceStats() {
  const { invoices } = useErp();
  const stats = [
    { title: "إجمالي الفواتير", value: formatNumber(invoices.length) },
    { title: "الفواتير المدفوعة", value: formatNumber(invoices.filter((invoice) => invoice.status === "paid").length) },
    { title: "المبالغ المستحقة", value: formatCurrency(invoices.filter((invoice) => invoice.status !== "paid").reduce((sum, invoice) => sum + invoice.total, 0)) },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {stats.map((item) => (
        <div key={item.title} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-400">{item.title}</p>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">{item.value}</h2>
        </div>
      ))}
    </div>
  );
}
