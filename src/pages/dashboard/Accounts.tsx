import AccountHeader from "../../components/accounting/AccountHeader";
import AccountStats from "../../components/accounting/AccountStats";
import AccountTable from "../../components/accounting/AccountTable";

export default function Accounts() {
  return (
    <div className="space-y-6">
      <AccountHeader />

      <AccountStats />

      <AccountTable />
    </div>
  );
}