import CustomerHeader from "../../components/customers/CustomerHeader";
import CustomerStats from "../../components/customers/CustomerStats";
import CustomerTable from "../../components/customers/CustomerTable";

export default function Customers() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <CustomerHeader search={search} onSearchChange={setSearch} />

      <CustomerStats />

      <CustomerTable search={search} />
    </div>
  );
}
import { useState } from "react";
