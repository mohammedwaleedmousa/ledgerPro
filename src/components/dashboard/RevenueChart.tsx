import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const data = [
  { name: "يناير", value: 4000 },
  { name: "فبراير", value: 7000 },
  { name: "مارس", value: 5500 },
  { name: "ابريل", value: 9500 },
  { name: "مايو", value: 13000 },
];

export default function RevenueChart() {
  return (
    <div className="h-96 rounded-3xl border border-gray-100 bg-white p-6">
      <h3 className="mb-6 text-lg font-bold">نمو الإيرادات</h3>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}