import { Wallet, TrendingUp, DollarSign, Receipt } from "lucide-react";
import MetricCard from "../../components/dashboard/MetricCard";
import AIInsightCard from "../../components/dashboard/AIInsightCard";
import RevenueChart from "../../components/dashboard/RevenueChart";
import CashFlow from "../../components/dashboard/CashFlow";
import Transactions from "../../components/dashboard/Transactions";
import TopProducts from "../../components/dashboard/TopProducts";

export default function Dashboard() {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          لوحة التحكم
        </h1>

        <p className="mt-2 text-gray-500">
          ملخص أداء شركتك اليوم
        </p>
      </div>


      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="الإيرادات"
          value="$124,500"
          change="+18.2%"
          icon={<TrendingUp />}
        />

        <MetricCard
          title="المصاريف"
          value="$42,300"
          change="-5.4%"
          positive={false}
          icon={<Receipt />}
        />

        <MetricCard
          title="صافي الربح"
          value="$82,200"
          change="+20.1%"
          icon={<DollarSign />}
        />

        <MetricCard
          title="الرصيد"
          value="$68,350"
          change="+12.5%"
          icon={<Wallet />}
        />
      </div>


      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>

        <AIInsightCard />
      </div>


      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Transactions />
        <CashFlow />
      </div>


      <TopProducts />

    </div>
  );
}