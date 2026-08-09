import Button from "../common/Button";
import Card from "../common/Card";
import Input from "../common/Input";

const rows = [
  { account: "الصندوق", debit: "$1000", credit: "-" },
  { account: "المبيعات", debit: "-", credit: "$1000" },
];

export default function JournalForm() {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-bold text-gray-900">
          بيانات القيد
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input
            label="التاريخ"
            type="date"
          />

          <Input
            label="رقم القيد"
            placeholder="JE-001"
          />
        </div>

        <div className="mt-5">
          <Input
            label="الوصف"
            placeholder="وصف العملية المالية"
          />
        </div>
      </Card>


      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            تفاصيل القيد
          </h2>

          <Button>
            إضافة سطر
          </Button>
        </div>


        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100">
          <table className="w-full text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-sm text-gray-500">
                  الحساب
                </th>

                <th className="p-4 text-sm text-gray-500">
                  مدين
                </th>

                <th className="p-4 text-sm text-gray-500">
                  دائن
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.account} className="border-t">
                  <td className="p-4 font-medium">
                    {row.account}
                  </td>

                  <td className="p-4">
                    {row.debit}
                  </td>

                  <td className="p-4">
                    {row.credit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        <div className="mt-6 flex justify-between rounded-2xl bg-gray-50 p-4">
          <span>
            المدين: $1000
          </span>

          <span>
            الدائن: $1000
          </span>
        </div>


        <Button className="mt-6">
          حفظ القيد
        </Button>
      </Card>
    </div>
  );
}