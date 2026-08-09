import Card from "../common/Card";

export default function AIInsight() {
  return (
    <Card>
      <h3 className="text-lg font-bold">
        التحليل الحالي
      </h3>

      <p className="mt-5 leading-8 text-gray-600">
        تحليل البيانات يظهر أن المبيعات ارتفعت بنسبة 18%
        مقارنة بالشهر الماضي، والمنتج الأكثر تأثيراً هو Laptop Pro.
      </p>

      <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-blue-700">
        التوصية:
        زيادة مخزون المنتجات ذات الطلب العالي.
      </div>
    </Card>
  );
}