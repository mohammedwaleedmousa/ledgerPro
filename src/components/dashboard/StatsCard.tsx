type Props = {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
};

export default function StatsCard({ title, value, change, positive = true }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <p className="text-sm text-gray-500">{title}</p>

      <h3 className="mt-3 text-2xl font-bold text-gray-900">
        {value}
      </h3>

      <p className={`mt-2 text-sm ${positive ? "text-green-600" : "text-red-500"}`}>
        {change}
      </p>
    </div>
  );
}