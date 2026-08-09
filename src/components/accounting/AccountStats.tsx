import Card from "../common/Card";

const stats = [
  {
    title: "إجمالي الأصول",
    value: "$450,000",
  },
  {
    title: "الالتزامات",
    value: "$120,000",
  },
  {
    title: "رأس المال",
    value: "$330,000",
  },
];

export default function AccountStats() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {stats.map((item) => (
        <Card key={item.title}>
          <p className="text-sm text-gray-400">
            {item.title}
          </p>

          <h2 className="mt-4 text-3xl font-bold">
            {item.value}
          </h2>
        </Card>
      ))}
    </div>
  );
}