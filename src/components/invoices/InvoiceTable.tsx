import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatDate } from "../../lib/format";
import type { InvoiceStatus } from "../../types/erp";
import Table from "../common/Table";

const statusLabels: Record<InvoiceStatus, string> = {
  draft: "مسودة",
  sent: "مرسلة",
  paid: "مدفوعة",
  overdue: "متأخرة",
};

const statusStyles: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-50 text-emerald-700",
  overdue: "bg-red-50 text-red-700",
};

export default function InvoiceTable({ search }: { search: string }) {
  const { invoices, updateInvoiceStatus } = useErp();
  const normalizedSearch = search.trim().toLowerCase();
  const filteredInvoices = invoices.filter((invoice) => !normalizedSearch || invoice.number.toLowerCase().includes(normalizedSearch) || invoice.customerName.toLowerCase().includes(normalizedSearch));

  return (
    <Table>
      <thead className="border-b bg-gray-50">
        <tr>
          <th className="p-5 text-sm font-medium text-gray-500">الرقم</th>
          <th className="p-5 text-sm font-medium text-gray-500">العميل</th>
          <th className="p-5 text-sm font-medium text-gray-500">التاريخ</th>
          <th className="p-5 text-sm font-medium text-gray-500">العناصر</th>
          <th className="p-5 text-sm font-medium text-gray-500">الإجمالي</th>
          <th className="p-5 text-sm font-medium text-gray-500">الحالة</th>
        </tr>
      </thead>
      <tbody>
        {filteredInvoices.map((invoice) => (
          <tr key={invoice.id} className="border-b last:border-none">
            <td className="p-5 font-mono text-sm font-semibold text-blue-700">{invoice.number}</td>
            <td className="p-5 text-gray-600">{invoice.customerName}</td>
            <td className="p-5 text-gray-500">{formatDate(invoice.issueDate)}</td>
            <td className="p-5 text-gray-500">{invoice.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
            <td className="p-5 font-semibold">{formatCurrency(invoice.total)}</td>
            <td className="p-5">
              <select aria-label={`حالة الفاتورة ${invoice.number}`} value={invoice.status} onChange={(event) => updateInvoiceStatus(invoice.id, event.target.value as InvoiceStatus)} className={`rounded-full border-0 px-3 py-1.5 text-sm font-medium outline-none ${statusStyles[invoice.status]}`}>
                {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </td>
          </tr>
        ))}
        {filteredInvoices.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-gray-400">لا توجد فواتير مطابقة.</td></tr>}
      </tbody>
    </Table>
  );
}
