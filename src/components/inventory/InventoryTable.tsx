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
  return: "مرتجع",
};

export default function InventoryTable({ search }: { search: string }) {
  const { stockMovements } = useErp();
  const normalizedSearch = search.trim().toLowerCase();
  const movements = stockMovements.filter((movement) => !normalizedSearch || movement.productName.toLowerCase().includes(normalizedSearch) || movement.reference.toLowerCase().includes(normalizedSearch));

  return (
    <Table minWidth="700px">
      <thead className="border-b border-slate-100 bg-slate-50/70"><tr><th className="p-4 text-[9px] font-bold text-slate-400">المنتج</th><th className="p-4 text-[9px] font-bold text-slate-400">الحركة</th><th className="p-4 text-[9px] font-bold text-slate-400">التغيير</th><th className="p-4 text-[9px] font-bold text-slate-400">الرصيد</th><th className="p-4 text-[9px] font-bold text-slate-400">المرجع</th><th className="p-4 text-[9px] font-bold text-slate-400">التاريخ</th></tr></thead>
      <tbody>
        {movements.map((movement) => (
          <tr key={movement.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50">
            <td className="p-4 text-xs font-bold text-slate-800">{movement.productName}</td>
            <td className="p-4"><Badge variant={movement.quantityDelta < 0 ? "warning" : "success"}>{movementLabels[movement.type]}</Badge></td>
            <td className={`p-4 text-xs font-extrabold ${movement.quantityDelta < 0 ? "text-rose-600" : "text-emerald-600"}`}>{movement.quantityDelta > 0 ? "+" : ""}{formatNumber(movement.quantityDelta)}</td>
            <td className="p-4 text-xs font-extrabold text-slate-800">{formatNumber(movement.balanceAfter)}</td>
            <td className="p-4 text-[10px] text-slate-500">{movement.reference}</td>
            <td className="p-4 text-[10px] text-slate-500">{formatDate(movement.date)}</td>
          </tr>
        ))}
        {movements.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-xs text-slate-400">لا توجد حركات مطابقة.</td></tr>}
      </tbody>
    </Table>
  );
}
