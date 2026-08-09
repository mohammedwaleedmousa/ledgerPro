import InvoiceForm from "../../components/invoices/InvoiceForm";
import InvoiceItems from "../../components/invoices/InvoiceItems";
import InvoiceSummary from "../../components/invoices/InvoiceSummary";

export default function CreateInvoice() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          إنشاء فاتورة
        </h1>

        <p className="mt-2 text-gray-500">
          إنشاء فاتورة جديدة للعميل
        </p>
      </div>

      <InvoiceForm />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <InvoiceItems />
        </div>

        <InvoiceSummary />
      </div>
    </div>
  );
}