import { Search } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
};

export default function InventoryHeader({ search, onSearchChange }: Props) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      <h1 className="text-3xl font-bold text-gray-900">المخزون</h1>
      <p className="mt-2 text-gray-500">متابعة الكميات وحركات المنتجات</p>

      <label className="mt-6 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
        <Search size={18} className="text-gray-400" />
        <span className="sr-only">البحث في المخزون</span>
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="المنتج أو المرجع..." className="w-full bg-transparent outline-none" />
      </label>
    </div>
  );
}
