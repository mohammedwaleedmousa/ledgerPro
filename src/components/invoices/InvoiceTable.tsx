import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatDate } from "../../lib/format";
import { appPaths } from "../../routes/navigation";
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
    <Table minWidth="760px">
      <thead className="border-b border-slate-100 bg-slate-50/70">
        <tr>
          <th className="p-4 text-[9px] font-bold text-slate-400">الرقم</th>
          <th className="p-4 text-[9px] font-bold text-slate-400">العميل</th>
          <th className="p-4 text-[9px] font-bold text-slate-400">التاريخ</th>
          <th className="p-4 text-[9px] font-bold text-slate-400">العناصر</th>
          <th className="p-4 text-[9px] font-bold text-slate-400">الإجمالي</th>
          <th className="p-4 text-[9px] font-bold text-slate-400">الحالة</th>
          <th className="p-4 text-[9px] font-bold text-slate-400">عرض</th>
        </tr>
      </thead>
      <tbody>
        {filteredInvoices.map((invoice) => (
          <tr key={invoice.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50">
            <td className="p-4 font-mono text-[11px] font-bold text-blue-700">{invoice.number}</td>
            <td className="p-4 text-xs font-bold text-slate-700">{invoice.customerName}</td>
            <td className="p-4 text-[10px] text-slate-500">{formatDate(invoice.issueDate)}</td>
            <td className="p-4 text-[10px] text-slate-500">{invoice.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
            <td className="p-4 text-xs font-extrabold text-slate-900">{formatCurrency(invoice.total)}</td>
            <td className="p-4">
              <select aria-label={`حالة الفاتورة ${invoice.number}`} value={invoice.status} onChange={(event) => updateInvoiceStatus(invoice.id, event.target.value as InvoiceStatus)} className={`rounded-full border-0 px-2.5 py-1.5 text-[9px] font-bold outline-none ${statusStyles[invoice.status]}`}>
                {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </td>
            <td className="p-4"><Link to={appPaths.invoiceDetails(invoice.id)} aria-label={`عرض ${invoice.number}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:text-blue-600"><Eye size={14} /></Link></td>
          </tr>
        ))}
        {filteredInvoices.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-xs text-slate-400">لا توجد فواتير مطابقة.</td></tr>}
      </tbody>
    </Table>
  );
}
