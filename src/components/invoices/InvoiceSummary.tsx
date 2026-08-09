export default function InvoiceSummary() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">

      <h2 className="text-lg font-bold">
        ملخص الفاتورة
      </h2>


      <div className="mt-6 space-y-4">

        <div className="flex justify-between">
          <span className="text-gray-500">
            المجموع
          </span>

          <span>
            $2400
          </span>
        </div>


        <div className="flex justify-between">
          <span className="text-gray-500">
            الضريبة
          </span>

          <span>
            $120
          </span>
        </div>


        <div className="flex justify-between border-t pt-4 text-lg font-bold">
          <span>
            الإجمالي
          </span>

          <span className="text-blue-600">
            $2520
          </span>
        </div>


      </div>


      <button className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-white transition hover:bg-blue-700">
        حفظ الفاتورة
      </button>

    </div>
  );
}