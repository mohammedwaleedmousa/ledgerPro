export default function InvoiceForm() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <h2 className="text-lg font-bold text-gray-900">
        بيانات الفاتورة
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        <div>
          <label className="text-sm text-gray-500">
            العميل
          </label>

          <select className="mt-2 w-full rounded-xl border border-gray-200 p-3 outline-none">
            <option>
              اختر العميل
            </option>
          </select>
        </div>


        <div>
          <label className="text-sm text-gray-500">
            تاريخ الإصدار
          </label>

          <input
            type="date"
            className="mt-2 w-full rounded-xl border border-gray-200 p-3 outline-none"
          />
        </div>


        <div>
          <label className="text-sm text-gray-500">
            طريقة الدفع
          </label>

          <select className="mt-2 w-full rounded-xl border border-gray-200 p-3 outline-none">
            <option>
              نقدي
            </option>

            <option>
              تحويل بنكي
            </option>

            <option>
              بطاقة
            </option>
          </select>
        </div>


        <div>
          <label className="text-sm text-gray-500">
            ملاحظات
          </label>

          <input
            placeholder="ملاحظات إضافية"
            className="mt-2 w-full rounded-xl border border-gray-200 p-3 outline-none"
          />
        </div>

      </div>
    </div>
  );
}