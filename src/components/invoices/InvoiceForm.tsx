import type { Customer, InvoiceStatus, PaymentMethod } from "../../types/erp";
import Card from "../common/Card";

type Props = {
  customers: Customer[];
  customerId: string;
  issueDate: string;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  notes: string;
  onCustomerChange: (value: string) => void;
  onIssueDateChange: (value: string) => void;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  onStatusChange: (value: InvoiceStatus) => void;
  onNotesChange: (value: string) => void;
};

export default function InvoiceForm(props: Props) {
  return (
    <Card>
      <h2 className="text-sm font-black text-slate-900">بيانات الفاتورة</h2>
      <p className="mt-1 text-[10px] text-slate-400">معلومات العميل والدفع والحالة التشغيلية.</p>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <label htmlFor="invoice-customer" className="block text-[11px] font-bold text-slate-600">العميل</label>
          <select id="invoice-customer" value={props.customerId} onChange={(event) => props.onCustomerChange(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" required>
            <option value="" disabled>اختر العميل</option>
            {props.customers.filter((customer) => customer.status === "active").map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="invoice-date" className="block text-[11px] font-bold text-slate-600">تاريخ الإصدار</label>
          <input id="invoice-date" type="date" value={props.issueDate} onChange={(event) => props.onIssueDateChange(event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" required />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="invoice-payment" className="block text-[11px] font-bold text-slate-600">طريقة الدفع</label>
          <select id="invoice-payment" value={props.paymentMethod} onChange={(event) => props.onPaymentMethodChange(event.target.value as PaymentMethod)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50">
            <option value="cash">نقدي</option><option value="bank">تحويل بنكي</option><option value="card">بطاقة</option><option value="credit">آجل</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="invoice-status" className="block text-[11px] font-bold text-slate-600">الحالة</label>
          <select id="invoice-status" value={props.status} onChange={(event) => props.onStatusChange(event.target.value as InvoiceStatus)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50">
            <option value="draft">مسودة</option><option value="sent">مرسلة</option><option value="paid">مدفوعة</option><option value="overdue">متأخرة</option>
          </select>
        </div>

        <div className="space-y-1.5 md:col-span-2 xl:col-span-4">
          <label htmlFor="invoice-notes" className="block text-[11px] font-bold text-slate-600">ملاحظات</label>
          <input id="invoice-notes" value={props.notes} onChange={(event) => props.onNotesChange(event.target.value)} placeholder="ملاحظات إضافية" className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" />
        </div>
      </div>
    </Card>
  );
}
