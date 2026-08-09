import { Plus, Search } from "lucide-react";
import Button from "../common/Button";

export default function ProductHeader() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            المنتجات
          </h1>

          <p className="mt-2 text-gray-500">
            إدارة المنتجات والمخزون والأسعار
          </p>
        </div>

        <Button>
          <span className="flex items-center gap-2">
            <Plus size={18} />
            إضافة منتج
          </span>
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
        <Search size={18} className="text-gray-400" />

        <input
          placeholder="البحث عن منتج..."
          className="w-full bg-transparent outline-none"
        />
      </div>
    </div>
  );
}