import { X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { appPaths, navigationSections } from "../../routes/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="إغلاق القائمة الجانبية"
          className="fixed inset-0 z-40 bg-gray-950/35 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        aria-label="القائمة الرئيسية"
        className={`fixed inset-y-0 right-0 z-50 flex h-dvh max-h-dvh w-72 max-w-[86vw] shrink-0 flex-col overflow-hidden border-l border-gray-100 bg-white shadow-xl transition-transform duration-300 motion-reduce:transition-none lg:z-40 lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-5 pt-6">
          <Link to={appPaths.dashboard} onClick={onClose}>
            <h1 className="text-3xl font-bold text-blue-600">LedgerPro</h1>
            <p className="mt-1 text-sm text-gray-400">منصة إدارة الأعمال</p>
          </Link>

          <button
            type="button"
            aria-label="إغلاق القائمة الجانبية"
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 pb-5 scrollbar-thin">
          {navigationSections.map((section) => (
            <section key={section.title} aria-label={section.title}>
              <h2 className="mb-2 px-4 text-xs font-semibold text-gray-400">{section.title}</h2>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        }`
                      }
                    >
                      <Icon size={19} aria-hidden="true" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="shrink-0 border-t border-gray-100 bg-white p-5">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 text-white">
            <p className="font-semibold">الخطة الاحترافية</p>
            <p className="mt-2 text-sm text-white/80">تقارير ومزايا إضافية لإدارة شركتك</p>
            <Link to={appPaths.settings} onClick={onClose} className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50">
              إدارة الخطة
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
