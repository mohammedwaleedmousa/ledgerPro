import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { appPaths } from "../routes/navigation";

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-blue-600">404</p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">الصفحة غير موجودة</h1>
        <p className="mt-3 text-gray-500">قد يكون الرابط غير صحيح أو تم نقل الصفحة إلى مسار آخر.</p>
        <Link to={appPaths.dashboard} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700">
          العودة إلى لوحة التحكم
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
