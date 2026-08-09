import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";
import Card from "../common/Card";

export default function CustomerStats() {
  const { customers } = useErp();
  const stats = [
    { title: "إجمالي العملاء", value: formatNumber(customers.length) },
    { title: "إجمالي المستحقات", value: formatCurrency(customers.reduce((sum, customer) => sum + customer.balance, 0)) },
    { title: "العملاء النشطون", value: formatNumber(customers.filter((customer) => customer.status === "active").length) },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {stats.map((item) => (
        <Card key={item.title}>
          <p className="text-sm text-gray-400">{item.title}</p>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">{item.value}</h2>
        </Card>
      ))}
    </div>
  );
}
