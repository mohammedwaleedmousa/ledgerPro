import JournalHeader from "../../components/accounting/JournalHeader";
import JournalTable from "../../components/accounting/JournalTable";

export default function Journal() {
  return (
    <div className="space-y-6">
      <JournalHeader />

      <JournalTable />
    </div>
  );
}