import { Search } from "lucide-react";

export default function InventoryHeader() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <h1 className="text-3xl font-bold text-gray-900">
        المخزون
      </h1>

      <p className="mt-2 text-gray-500">
        متابعة الكميات وحركة المنتجات
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
        <Search size={18} className="text-gray-400" />

        <input
          placeholder="البحث في المخزون..."
          className="w-full bg-transparent outline-none"
        />
      </div>
    </div>
  );
}