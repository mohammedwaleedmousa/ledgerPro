export default function CashFlow() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <h3 className="text-lg font-bold">التدفق النقدي</h3>

      <div className="mt-6">
        <p className="text-4xl font-bold text-gray-900">$68,350</p>
        <p className="mt-2 text-green-600">↑ 12.5%</p>
      </div>

      <div className="mt-8 flex h-24 items-end gap-3 rounded-2xl bg-blue-50 p-5">
        <span className="h-8 w-4 rounded bg-blue-300" />
        <span className="h-16 w-4 rounded bg-blue-500" />
        <span className="h-12 w-4 rounded bg-blue-400" />
        <span className="h-20 w-4 rounded bg-blue-600" />
      </div>
    </div>
  );
}