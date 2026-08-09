import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InvoiceForm from "../../components/invoices/InvoiceForm";
import InvoiceItems from "../../components/invoices/InvoiceItems";
import InvoiceSummary from "../../components/invoices/InvoiceSummary";
import { useErp } from "../../context/ErpContext";
import { appPaths } from "../../routes/navigation";
import type { InvoiceInput, InvoiceStatus, PaymentMethod } from "../../types/erp";

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { customers, products, createInvoice } = useErp();
  const [customerId, setCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(5);
  const [items, setItems] = useState<InvoiceInput["items"]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items]);
  const taxAmount = subtotal * (Math.max(0, taxRate) / 100);
  const total = subtotal + taxAmount;

  function handleSave() {
    setSaving(true);
    setError(null);
    try {
      createInvoice({ customerId, issueDate, paymentMethod, status, notes, taxRate, items });
      navigate(appPaths.invoices, { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ الفاتورة.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-gray-900">إنشاء فاتورة</h1><p className="mt-2 text-gray-500">اختر العميل والمنتجات وسيحسب النظام الإجمالي والمخزون تلقائيًا</p></div>
      {error && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <InvoiceForm customers={customers} customerId={customerId} issueDate={issueDate} paymentMethod={paymentMethod} status={status} notes={notes} onCustomerChange={setCustomerId} onIssueDateChange={setIssueDate} onPaymentMethodChange={setPaymentMethod} onStatusChange={setStatus} onNotesChange={setNotes} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><InvoiceItems products={products} items={items} onItemsChange={setItems} /></div>
        <InvoiceSummary subtotal={subtotal} taxRate={taxRate} taxAmount={taxAmount} total={total} saving={saving} onTaxRateChange={setTaxRate} onSave={handleSave} />
      </div>
    </div>
  );
}
