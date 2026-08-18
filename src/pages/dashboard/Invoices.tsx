import InvoiceHeader from "../../components/invoices/InvoiceHeader";
import InvoiceStats from "../../components/invoices/InvoiceStats";
import InvoiceTable from "../../components/invoices/InvoiceTable";

export default function Invoices() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-4">
      <InvoiceHeader search={search} onSearchChange={setSearch} />
      <InvoiceStats />
      <InvoiceTable search={search} />
    </div>
  );
}
import { useState } from "react";
