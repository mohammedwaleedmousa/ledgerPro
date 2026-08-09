type Props = {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  positive?: boolean;
};

export default function MetricCard({ title, value, change, icon, positive = true }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">

      <div className="flex items-center justify-between">

        <p className="text-sm text-gray-400">
          {title}
        </p>

        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          {icon}
        </div>

      </div>


      <h2 className="text-3xl font-bold mt-5 text-gray-900">
        {value}
      </h2>


      <p className={`mt-3 text-sm ${positive ? "text-green-600" : "text-red-500"}`}>
        {change} مقارنة بالشهر الماضي
      </p>

    </div>
  );
}