import { Sparkles } from "lucide-react";

export default function AIInsightCard() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-500 p-6 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
          <Sparkles size={20} />
        </div>

        <h3 className="text-lg font-semibold">التحليل الذكي</h3>
      </div>

      <p className="mt-5 leading-8 text-white/90">
        ارتفعت الأرباح بنسبة 18% هذا الشهر بسبب زيادة المبيعات وانخفاض المصاريف التشغيلية.
      </p>

      <button className="mt-6 rounded-xl bg-white px-5 py-3 font-medium text-blue-600 transition hover:bg-gray-100">
        تحدث مع المساعد
      </button>
    </div>
  );
}