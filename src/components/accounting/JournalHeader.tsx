import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { appPaths } from "../../routes/navigation";
import Button from "../common/Button";

export default function JournalHeader() {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            القيود اليومية
          </h1>

          <p className="mt-2 text-gray-500">
            متابعة جميع العمليات المالية
          </p>
        </div>

        <Button onClick={() => navigate(appPaths.createJournal)}>
          <span className="flex items-center gap-2">
            <Plus size={18} />
            إنشاء قيد
          </span>
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
        <Search size={18} className="text-gray-400" />

        <input
          placeholder="البحث في القيود..."
          className="w-full bg-transparent outline-none"
        />
      </div>
    </div>
  );
}
