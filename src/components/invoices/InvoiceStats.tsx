import { CircleDollarSign, CircleCheckBig, Files } from "lucide-react";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";
import type { Invoice } from "../../types/erp";
import StatCard from "../common/StatCard";

export default function InvoiceStats({ invoices: suppliedInvoices }: { invoices?: Invoice[] }) {
  const erp = useErp();
  const invoices = suppliedInvoices ?? erp.invoices;
  return <div className="grid gap-3 md:grid-cols-3"><StatCard title="إجمالي الفواتير" value={formatNumber(invoices.length)} icon={Files} /><StatCard title="الفواتير المدفوعة" value={formatNumber(invoices.filter((invoice) => invoice.status === "paid").length)} icon={CircleCheckBig} tone="emerald" /><StatCard title="المبالغ المستحقة" value={formatCurrency(invoices.filter((invoice) => invoice.status !== "paid").reduce((sum, invoice) => sum + invoice.total, 0))} icon={CircleDollarSign} tone="amber" /></div>;
}
