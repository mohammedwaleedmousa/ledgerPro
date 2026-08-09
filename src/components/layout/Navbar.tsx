import { Bell, ChevronDown, LogOut, Menu, Search } from "lucide-react";
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
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md md:px-5 xl:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button type="button" aria-label="فتح القائمة الجانبية" className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden" onClick={onMenuClick}>
          <Menu size={20} />
        </button>

        <label className="hidden h-9 w-full max-w-[340px] items-center gap-2.5 rounded-[10px] border border-slate-200/80 bg-slate-50/80 px-3 md:flex">
          <Search size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
          <span className="sr-only">البحث في النظام</span>
          <input aria-label="البحث في النظام" placeholder="ابحث عن أي شيء..." className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" />
          <kbd className="hidden shrink-0 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 xl:inline">Ctrl K</kbd>
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        {user?.mode === "demo" && <span className="hidden rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 md:inline-flex">نسخة تجريبية</span>}

        <button type="button" aria-label="الإشعارات" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50">
          <Bell size={17} />
          <span className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        <div className="mx-0.5 h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-200 text-xs font-extrabold text-amber-900 ring-2 ring-white">{user?.name?.trim().charAt(0) || "م"}</div>
          <div className="hidden max-w-36 sm:block">
            <p className="truncate text-xs font-bold text-slate-900">{user?.name ?? "مستخدم"}</p>
            <p className="mt-0.5 truncate text-[10px] text-slate-400">{company?.name ?? (user ? roleLabels[user.role] : "")}</p>
          </div>
          <ChevronDown size={14} className="hidden text-slate-400 sm:block" aria-hidden="true" />
        </div>

        <button type="button" aria-label="تسجيل الخروج" title="تسجيل الخروج" className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600" onClick={() => void handleLogout()}>
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
