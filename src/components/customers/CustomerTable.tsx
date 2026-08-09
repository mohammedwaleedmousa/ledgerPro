import { Pencil, Trash2 } from "lucide-react";
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
      {error && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <Table>
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="p-5 text-sm text-gray-500">العميل</th>
            <th className="p-5 text-sm text-gray-500">الهاتف</th>
            <th className="p-5 text-sm text-gray-500">الرصيد</th>
            <th className="p-5 text-sm text-gray-500">الفواتير</th>
            <th className="p-5 text-sm text-gray-500">الحالة</th>
            <th className="p-5 text-sm text-gray-500">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((customer) => (
            <tr key={customer.id} className="border-b last:border-none">
              <td className="p-5"><p className="font-medium">{customer.name}</p><p className="mt-1 text-xs text-gray-400">{customer.email || "لا يوجد بريد"}</p></td>
              <td className="p-5 text-gray-500">{customer.phone || "—"}</td>
              <td className="p-5 font-semibold">{formatCurrency(customer.balance)}</td>
              <td className="p-5 text-gray-500">{invoices.filter((invoice) => invoice.customerId === customer.id).length}</td>
              <td className="p-5"><Badge variant={customer.status === "active" ? "success" : "danger"}>{customer.status === "active" ? "نشط" : "غير نشط"}</Badge></td>
              <td className="p-5"><div className="flex items-center gap-2">
                <button type="button" aria-label={`تعديل ${customer.name}`} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" onClick={() => navigate(appPaths.editCustomer(customer.id))}><Pencil size={17} /></button>
                <button type="button" aria-label={`حذف ${customer.name}`} className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => handleDelete(customer.id, customer.name)}><Trash2 size={17} /></button>
              </div></td>
            </tr>
          ))}
          {filteredCustomers.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-gray-400">لا يوجد عملاء مطابقون.</td></tr>}
        </tbody>
      </Table>
    </div>
  );
}
