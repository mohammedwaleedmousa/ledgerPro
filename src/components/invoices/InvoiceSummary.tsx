import { formatCurrency } from "../../lib/format";
import Button from "../common/Button";
import Card from "../common/Card";

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
    <Card className="h-fit xl:sticky xl:top-24">
      <h2 className="text-sm font-black text-slate-900">ملخص الفاتورة</h2>
      <p className="mt-1 text-[10px] text-slate-400">المبالغ قبل الحفظ النهائي.</p>
      <div className="mt-5 space-y-4 text-[11px]">
        <div className="flex justify-between"><span className="text-slate-500">المجموع</span><strong>{formatCurrency(subtotal)}</strong></div>
        <label className="flex items-center justify-between gap-4"><span className="text-slate-500">الضريبة</span><span className="flex items-center gap-2"><input aria-label="نسبة الضريبة" type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(event) => onTaxRateChange(Number(event.target.value))} className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-center text-xs outline-none" />%</span></label>
        <div className="flex justify-between"><span className="text-slate-500">قيمة الضريبة</span><strong>{formatCurrency(taxAmount)}</strong></div>
        <div className="flex justify-between border-t border-slate-200 pt-4 text-sm font-black"><span>الإجمالي</span><span className="text-blue-600">{formatCurrency(total)}</span></div>
      </div>
      <Button className="mt-5 w-full" loading={saving} onClick={onSave}>حفظ الفاتورة</Button>
    </Card>
  );
}
