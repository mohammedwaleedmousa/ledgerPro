import CustomerHeader from "../../components/customers/CustomerHeader";
import CustomerStats from "../../components/customers/CustomerStats";
import CustomerTable from "../../components/customers/CustomerTable";

export default function Customers() {
  return (
    <div className="space-y-6">
      <CustomerHeader />

      <CustomerStats />

      <CustomerTable />
    </div>
  );
}