import Card from "../common/Card";

const reports = [
  {
    title: "الإيرادات",
    value: "$245,000",
  },
  {
    title: "المصروفات",
    value: "$82,000",
  },
  {
    title: "صافي الربح",
    value: "$163,000",
  },
  {
    title: "النمو",
    value: "+18%",
  },
];

export default function ReportCards() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {reports.map((item) => (
        <Card key={item.title}>
          <p className="text-sm text-gray-400">
            {item.title}
          </p>

          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            {item.value}
          </h2>
        </Card>
      ))}
    </div>
  );
}