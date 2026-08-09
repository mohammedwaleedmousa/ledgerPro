import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useErp } from "../../context/ErpContext";
import { formatCurrency } from "../../lib/format";
import { appPaths } from "../../routes/navigation";
import Badge from "../common/Badge";
import Table from "../common/Table";

type Props = {
  search: string;
};

export default function CustomerTable({ search }: Props) {
  const navigate = useNavigate();
  const { customers, invoices, removeCustomer } = useErp();
  const [error, setError] = useState<string | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredCustomers = customers.filter((customer) => !normalizedSearch || [customer.name, customer.phone, customer.email].some((value) => value.toLowerCase().includes(normalizedSearch)));

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`هل تريد حذف العميل «${name}»؟`)) return;
    try {
      removeCustomer(id);
      setError(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "تعذر حذف العميل.");
    }
  }

  return (
    <div className="space-y-3">
      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}
      <Table minWidth="760px">
        <thead className="border-b border-slate-100 bg-slate-50/70">
          <tr>
            <th className="p-4 text-[9px] font-bold text-slate-400">العميل</th>
            <th className="p-4 text-[9px] font-bold text-slate-400">الهاتف</th>
            <th className="p-4 text-[9px] font-bold text-slate-400">الرصيد</th>
            <th className="p-4 text-[9px] font-bold text-slate-400">الفواتير</th>
            <th className="p-4 text-[9px] font-bold text-slate-400">الحالة</th>
            <th className="p-4 text-[9px] font-bold text-slate-400">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((customer) => (
            <tr key={customer.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50">
              <td className="p-4"><p className="text-xs font-bold text-slate-800">{customer.name}</p><p className="mt-1 text-[9px] text-slate-400">{customer.email || "لا يوجد بريد"}</p></td>
              <td className="p-4 text-[10px] text-slate-500">{customer.phone || "—"}</td>
              <td className="p-4 text-xs font-extrabold text-slate-900">{formatCurrency(customer.balance)}</td>
              <td className="p-4 text-[10px] text-slate-500">{invoices.filter((invoice) => invoice.customerId === customer.id).length}</td>
              <td className="p-4"><Badge variant={customer.status === "active" ? "success" : "danger"}>{customer.status === "active" ? "نشط" : "غير نشط"}</Badge></td>
              <td className="p-4"><div className="flex items-center gap-2">
                <button type="button" aria-label={`عرض ${customer.name}`} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600" onClick={() => navigate(appPaths.customerDetails(customer.id))}><Eye size={13} /></button>
                <button type="button" aria-label={`تعديل ${customer.name}`} className="rounded-lg border border-slate-200 p-1.5 text-blue-600 hover:bg-blue-50" onClick={() => navigate(appPaths.editCustomer(customer.id))}><Pencil size={13} /></button>
                <button type="button" aria-label={`حذف ${customer.name}`} className="rounded-lg border border-slate-200 p-1.5 text-rose-500 hover:bg-rose-50" onClick={() => handleDelete(customer.id, customer.name)}><Trash2 size={13} /></button>
              </div></td>
            </tr>
          ))}
          {filteredCustomers.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-xs text-slate-400">لا يوجد عملاء مطابقون.</td></tr>}
        </tbody>
      </Table>
    </div>
  );
}
