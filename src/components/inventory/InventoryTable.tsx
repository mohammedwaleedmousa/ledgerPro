import { useErp } from "../../context/ErpContext";
import { formatDate, formatNumber } from "../../lib/format";
import type { StockMovementType } from "../../types/erp";
import Badge from "../common/Badge";
import Table from "../common/Table";

const movementLabels: Record<StockMovementType, string> = {
  opening: "افتتاحي",
  sale: "بيع",
  adjustment: "تسوية",
  purchase: "إضافة",
};

export default function InventoryTable({ search }: { search: string }) {
  const { stockMovements } = useErp();
  const normalizedSearch = search.trim().toLowerCase();
  const movements = stockMovements.filter((movement) => !normalizedSearch || movement.productName.toLowerCase().includes(normalizedSearch) || movement.reference.toLowerCase().includes(normalizedSearch));

  return (
    <Table>
      <thead className="border-b bg-gray-50"><tr><th className="p-5 text-sm text-gray-500">المنتج</th><th className="p-5 text-sm text-gray-500">الحركة</th><th className="p-5 text-sm text-gray-500">التغيير</th><th className="p-5 text-sm text-gray-500">الرصيد</th><th className="p-5 text-sm text-gray-500">المرجع</th><th className="p-5 text-sm text-gray-500">التاريخ</th></tr></thead>
      <tbody>
        {movements.map((movement) => (
          <tr key={movement.id} className="border-b last:border-none">
            <td className="p-5 font-medium">{movement.productName}</td>
            <td className="p-5"><Badge variant={movement.quantityDelta < 0 ? "warning" : "success"}>{movementLabels[movement.type]}</Badge></td>
            <td className={`p-5 font-semibold ${movement.quantityDelta < 0 ? "text-red-600" : "text-emerald-600"}`}>{movement.quantityDelta > 0 ? "+" : ""}{formatNumber(movement.quantityDelta)}</td>
            <td className="p-5 font-semibold">{formatNumber(movement.balanceAfter)}</td>
            <td className="p-5 text-gray-500">{movement.reference}</td>
            <td className="p-5 text-gray-500">{formatDate(movement.date)}</td>
          </tr>
        ))}
        {movements.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-gray-400">لا توجد حركات مطابقة.</td></tr>}
      </tbody>
    </Table>
  );
}
