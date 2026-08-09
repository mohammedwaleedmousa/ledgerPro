import { Download } from "lucide-react";
import Button from "../common/Button";

export default function ReportHeader() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            التقارير المالية
          </h1>

          <p className="mt-2 text-gray-500">
            تحليل أداء الشركة واتخاذ القرارات
          </p>
        </div>

        <Button>
          <span className="flex items-center gap-2">
            <Download size={18} />
            تصدير PDF
          </span>
        </Button>
      </div>

      <div className="mt-6 flex gap-3">
        <select className="rounded-xl border border-gray-200 px-4 py-3 outline-none">
          <option>هذا الشهر</option>
          <option>آخر 3 أشهر</option>
          <option>هذه السنة</option>
        </select>
      </div>
    </div>
  );
}