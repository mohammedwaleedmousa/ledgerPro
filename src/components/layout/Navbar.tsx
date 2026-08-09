import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCompany } from "../../context/CompanyContext";

type Props = {
  onMenuClick: () => void;
};

const roleLabels = {
  owner: "المالك",
  admin: "مدير",
  accountant: "محاسب",
  employee: "موظف",
};

export default function Navbar({ onMenuClick }: Props) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { company } = useCompany();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-gray-100 bg-white/90 px-4 backdrop-blur md:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button type="button" aria-label="فتح القائمة الجانبية" className="rounded-xl p-2.5 text-gray-600 transition hover:bg-gray-100 lg:hidden" onClick={onMenuClick}>
          <Menu size={22} />
        </button>

        <label className="hidden w-full max-w-md items-center gap-3 rounded-xl bg-gray-50 px-4 py-2.5 md:flex">
          <Search size={18} className="shrink-0 text-gray-400" aria-hidden="true" />
          <span className="sr-only">البحث في النظام</span>
          <input aria-label="البحث في النظام" placeholder="ابحث في النظام..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" />
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {user?.mode === "demo" && <span className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 md:inline-flex">وضع تجريبي</span>}

        <button type="button" aria-label="الإشعارات" className="rounded-xl p-2.5 text-gray-600 transition hover:bg-gray-100">
          <Bell size={21} />
        </button>

        <div className="flex items-center gap-3 border-r border-gray-100 pr-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">{user?.name?.trim().charAt(0) || "م"}</div>
          <div className="hidden max-w-40 sm:block">
            <p className="truncate text-sm font-semibold text-gray-900">{user?.name ?? "مستخدم"}</p>
            <p className="truncate text-xs text-gray-400">{company?.name ?? (user ? roleLabels[user.role] : "")}</p>
          </div>
        </div>

        <button type="button" aria-label="تسجيل الخروج" title="تسجيل الخروج" className="rounded-xl p-2.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600" onClick={() => void handleLogout()}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
