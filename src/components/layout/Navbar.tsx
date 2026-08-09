import { Bell, Menu, Search } from "lucide-react";

type Props = {
  onMenuClick: () => void;
};

export default function Navbar({ onMenuClick }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-gray-100 bg-white/90 px-4 backdrop-blur md:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          aria-label="فتح القائمة الجانبية"
          className="rounded-xl p-2.5 text-gray-600 transition hover:bg-gray-100 lg:hidden"
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>

        <label className="hidden w-full max-w-md items-center gap-3 rounded-xl bg-gray-50 px-4 py-2.5 md:flex">
          <Search size={18} className="shrink-0 text-gray-400" aria-hidden="true" />
          <span className="sr-only">البحث في النظام</span>
          <input aria-label="البحث في النظام" placeholder="ابحث في النظام..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" />
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        <button type="button" aria-label="الإشعارات" className="rounded-xl p-2.5 text-gray-600 transition hover:bg-gray-100">
          <Bell size={21} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">م</div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">محمد</p>
            <p className="text-xs text-gray-400">المالك</p>
          </div>
        </div>
      </div>
    </header>
  );
}
