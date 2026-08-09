export default function CashFlow() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          التدفق النقدي
        </h3>

        <span className="text-sm text-green-600">
          +12.5%
        </span>
      </div>

      <div className="mt-6">
        <p className="text-4xl font-bold text-gray-900">
          $68,350
        </p>

        <p className="mt-2 text-sm text-gray-400">
          مقارنة بالشهر الماضي
        </p>
      </div>

      <div className="mt-8 flex h-32 items-end gap-3 rounded-2xl bg-blue-50 p-5">
        <span className="h-10 w-5 rounded-lg bg-blue-300" />
        <span className="h-20 w-5 rounded-lg bg-blue-500" />
        <span className="h-14 w-5 rounded-lg bg-blue-400" />
        <span className="h-24 w-5 rounded-lg bg-blue-600" />
        <span className="h-16 w-5 rounded-lg bg-blue-400" />
      </div>
    </div>
  );
}