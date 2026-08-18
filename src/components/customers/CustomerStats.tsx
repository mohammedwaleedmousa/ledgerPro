import { CircleDollarSign, UserCheck, Users } from "lucide-react";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";
import StatCard from "../common/StatCard";

export default function CustomerStats() {
  const { customers } = useErp();
  return <div className="grid gap-3 md:grid-cols-3"><StatCard title="إجمالي العملاء" value={formatNumber(customers.length)} icon={Users} /><StatCard title="إجمالي المستحقات" value={formatCurrency(customers.reduce((sum, customer) => sum + customer.balance, 0))} icon={CircleDollarSign} tone="amber" /><StatCard title="العملاء النشطون" value={formatNumber(customers.filter((customer) => customer.status === "active").length)} icon={UserCheck} tone="emerald" /></div>;
}
