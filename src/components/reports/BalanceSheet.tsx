export default function BalanceSheet() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <h3 className="text-lg font-bold">
        الميزانية العمومية
      </h3>

      <div className="mt-6 space-y-4">
        <div className="flex justify-between">
          <span>
            الأصول
          </span>

          <span className="font-semibold">
            $450,000
          </span>
        </div>

        <div className="flex justify-between">
          <span>
            الالتزامات
          </span>

          <span className="font-semibold">
            $120,000
          </span>
        </div>

        <div className="flex justify-between border-t pt-4">
          <span>
            حقوق الملكية
          </span>

          <span className="font-semibold">
            $330,000
          </span>
        </div>
      </div>
    </div>
  );
}