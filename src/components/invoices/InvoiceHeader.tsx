import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { appPaths } from "../../routes/navigation";

export default function InvoiceHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          الفواتير
        </h1>

        <p className="mt-2 text-gray-500">
          إدارة ومتابعة جميع فواتير الشركة
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3">
          <Search size={18} className="text-gray-400" />

          <input
            placeholder="بحث عن فاتورة..."
            className="bg-transparent outline-none text-sm"
          />
        </div>

        <button type="button" onClick={() => navigate(appPaths.createInvoice)} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700">
          <Plus size={18} />
          إنشاء فاتورة
        </button>
      </div>
    </div>
  );
}
