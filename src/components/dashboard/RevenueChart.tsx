import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useErp } from "../../context/ErpContext";

export default function RevenueChart() {
  const { invoices } = useErp();
  const formatter = new Intl.DateTimeFormat("ar", { month: "short" });
  const now = new Date();
  const data = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const value = invoices
      .filter((invoice) => {
        const invoiceDate = new Date(invoice.issueDate);
        return invoice.status === "paid" && invoiceDate.getFullYear() === date.getFullYear() && invoiceDate.getMonth() === date.getMonth();
      })
      .reduce((sum, invoice) => sum + invoice.total, 0);
    return { name: formatter.format(date), value };
  });

  return (
    <div className="h-96 min-w-0 rounded-3xl border border-gray-100 bg-white p-6">
      <h3 className="mb-6 text-lg font-bold">الإيرادات المدفوعة</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "الإيراد"]} />
          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
