import { Plus, Search } from "lucide-react";
import Button from "../common/Button";
import { useNavigate } from "react-router-dom";

export default function CustomerHeader() {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            العملاء
          </h1>

          <p className="mt-2 text-gray-500">
            إدارة العملاء والمدفوعات والأرصدة
          </p>
        </div>

        <Button onClick={() => navigate("/app/customers/create")}>
          <span className="flex items-center gap-2">
            <Plus size={18} />
            إضافة عميل
          </span>
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
        <Search size={18} className="text-gray-400" />
        <input
          placeholder="البحث عن عميل..."
          className="w-full bg-transparent outline-none"
        />
      </div>
    </div>
  );
}