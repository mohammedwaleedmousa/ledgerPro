import { X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navigationSections } from "../../routes/navigation";

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
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col overflow-y-auto border-l border-gray-100 bg-white p-5 shadow-xl transition-transform duration-300 motion-reduce:transition-none lg:z-40 lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">LedgerPro</h1>
            <p className="mt-1 text-sm text-gray-400">منصة إدارة الأعمال</p>
          </div>

          <button
            type="button"
            aria-label="إغلاق القائمة الجانبية"
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-6">
          {navigationSections.map((section) => (
            <section key={section.title} aria-label={section.title}>
              <h2 className="mb-2 px-4 text-xs font-semibold text-gray-400">
                {section.title}
              </h2>

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

        <div className="mt-8 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 text-white">
          <p className="font-semibold">الخطة الاحترافية</p>
          <p className="mt-2 text-sm text-white/80">تقارير متقدمة ومزايا إضافية لإدارة شركتك</p>
          <button type="button" className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50">
            عرض الخطط
          </button>
        </div>
      </aside>
    </>
  );
}
