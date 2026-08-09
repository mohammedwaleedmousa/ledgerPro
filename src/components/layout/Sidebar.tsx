import { Crown, Layers3, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { appPaths, navigationSections } from "../../routes/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: Props) {
  const { pathname } = useLocation();

  function isActivePath(path: string) {
    if (path === appPaths.dashboard) return pathname === path;
    if (path === appPaths.createInvoice) return pathname === path;
    if (path === appPaths.invoices) return pathname === path || (pathname.startsWith(`${path}/`) && pathname !== appPaths.createInvoice);
    if (path === appPaths.products) return pathname === path || pathname.startsWith(`${path}/`);
    if (path === appPaths.customers) return pathname === path || pathname.startsWith(`${path}/`);
    if (path === appPaths.journal) return pathname === path || pathname.startsWith(`${path}/`);
    return pathname === path;
  }

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
        className={`fixed inset-y-0 right-0 z-50 flex h-dvh max-h-dvh w-[260px] max-w-[86vw] shrink-0 flex-col overflow-hidden border-l border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 transition-transform duration-300 motion-reduce:transition-none lg:z-40 lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-[68px] shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5">
          <Link to={appPaths.dashboard} onClick={onClose} className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-blue-600 text-white shadow-sm shadow-blue-200">
              <Layers3 size={19} strokeWidth={2.4} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[17px] font-extrabold tracking-tight text-slate-950">LedgerPro</span>
              <span className="block truncate text-[10px] font-medium text-slate-400">إدارة أعمالك بوضوح</span>
            </span>
          </Link>

          <button
            type="button"
            aria-label="إغلاق القائمة الجانبية"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="app-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4">
          {navigationSections.map((section) => (
            <section key={section.title} aria-label={section.title}>
              <h2 className="mb-1.5 px-3 text-[10px] font-bold tracking-wide text-slate-400">{section.title}</h2>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={() =>
                        `relative flex min-h-10 w-full items-center gap-3 overflow-hidden rounded-[10px] px-3 py-2 text-[13px] font-semibold transition-colors before:absolute before:bottom-2 before:right-0 before:top-2 before:w-0.5 before:rounded-full ${
                          active
                            ? "bg-blue-50 text-blue-700 before:bg-blue-600"
                            : "text-slate-600 before:bg-transparent hover:bg-slate-50 hover:text-slate-950"
                        }`
                      }
                    >
                      <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-100 bg-white p-3.5">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-950 p-4 text-white shadow-lg shadow-blue-900/15">
            <div className="absolute -left-7 -top-8 h-24 w-24 rounded-full border border-white/10" />
            <div className="absolute -left-2 -top-2 h-14 w-14 rounded-full bg-white/5" />
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/15"><Crown size={16} aria-hidden="true" /></span>
            <p className="relative mt-3 text-sm font-bold">الخطة الاحترافية</p>
            <p className="relative mt-1 text-[11px] leading-5 text-white/70">فعّل التقارير المتقدمة وإدارة الفريق.</p>
            <Link to={appPaths.settings} onClick={onClose} className="relative mt-3 flex w-full items-center justify-center rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-blue-700 transition hover:bg-blue-50">
              إدارة الاشتراك
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
