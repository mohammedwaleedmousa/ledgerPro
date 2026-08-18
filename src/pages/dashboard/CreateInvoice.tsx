import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InvoiceForm from "../../components/invoices/InvoiceForm";
import InvoiceItems from "../../components/invoices/InvoiceItems";
import InvoiceSummary from "../../components/invoices/InvoiceSummary";
import { useErp } from "../../context/ErpContext";
import { appPaths } from "../../routes/navigation";
import type { InvoiceInput, InvoiceStatus, PaymentMethod } from "../../types/erp";
import PageHeader from "../../components/common/PageHeader";

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { customers, products, settings, createInvoice } = useErp();
  const [customerId, setCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(settings.taxRate);
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
    <div className="space-y-4">
      <PageHeader title="إنشاء فاتورة" description="اختر العميل والمنتجات؛ يحسب النظام الضريبة والإجمالي ويحدّث المخزون تلقائياً." eyebrow="المبيعات" />
      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}
      <InvoiceForm customers={customers} customerId={customerId} issueDate={issueDate} paymentMethod={paymentMethod} status={status} notes={notes} onCustomerChange={setCustomerId} onIssueDateChange={setIssueDate} onPaymentMethodChange={setPaymentMethod} onStatusChange={setStatus} onNotesChange={setNotes} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2"><InvoiceItems products={products} items={items} onItemsChange={setItems} /></div>
        <InvoiceSummary subtotal={subtotal} taxRate={taxRate} taxAmount={taxAmount} total={total} saving={saving} onTaxRateChange={setTaxRate} onSave={handleSave} />
      </div>
    </div>
  );
}
