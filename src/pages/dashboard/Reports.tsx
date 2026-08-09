import ReportHeader from "../../components/reports/ReportHeader";
import ReportCards from "../../components/reports/ReportCards";
import ProfitLoss from "../../components/reports/ProfitLoss";
import CashFlowReport from "../../components/reports/CashFlowReport";
import BalanceSheet from "../../components/reports/BalanceSheet";

export default function Reports() {
  return (
    <div className="space-y-6">
      <ReportHeader />

      <ReportCards />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ProfitLoss />

        <CashFlowReport />

        <BalanceSheet />
      </div>
    </div>
  );
}