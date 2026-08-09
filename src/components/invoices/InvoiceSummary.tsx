import { formatCurrency } from "../../lib/format";
import Button from "../common/Button";

type Props = {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  saving: boolean;
  onTaxRateChange: (value: number) => void;
  onSave: () => void;
};

export default function InvoiceSummary({ subtotal, taxRate, taxAmount, total, saving, onTaxRateChange, onSave }: Props) {
  return (
    <div className="h-fit rounded-3xl border border-gray-100 bg-white p-6 xl:sticky xl:top-28">
      <h2 className="text-lg font-bold">ملخص الفاتورة</h2>
      <div className="mt-6 space-y-4">
        <div className="flex justify-between"><span className="text-gray-500">المجموع</span><span>{formatCurrency(subtotal)}</span></div>
        <label className="flex items-center justify-between gap-4"><span className="text-gray-500">الضريبة</span><span className="flex items-center gap-2"><input aria-label="نسبة الضريبة" type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(event) => onTaxRateChange(Number(event.target.value))} className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-center outline-none" />%</span></label>
        <div className="flex justify-between"><span className="text-gray-500">قيمة الضريبة</span><span>{formatCurrency(taxAmount)}</span></div>
        <div className="flex justify-between border-t pt-4 text-lg font-bold"><span>الإجمالي</span><span className="text-blue-600">{formatCurrency(total)}</span></div>
      </div>
      <Button className="mt-6 w-full" loading={saving} onClick={onSave}>حفظ الفاتورة</Button>
    </div>
  );
}
