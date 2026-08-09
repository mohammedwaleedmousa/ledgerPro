import InvoiceHeader from "../../components/invoices/InvoiceHeader";
import InvoiceStats from "../../components/invoices/InvoiceStats";
import InvoiceTable from "../../components/invoices/InvoiceTable";

export default function Invoices() {
  return (
    <div className="space-y-6">

      <InvoiceHeader />

      <InvoiceStats />

      <InvoiceTable />

    </div>
  );
}