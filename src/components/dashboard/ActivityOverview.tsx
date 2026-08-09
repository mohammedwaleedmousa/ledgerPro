import { MoreHorizontal } from "lucide-react";
import { useErp } from "../../context/ErpContext";

const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const shortDays = ["أحد", "اثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];

export default function ActivityOverview() {
  const { invoices, customers } = useErp();
  const activity = weekDays.map((day, index) => ({
    day,
    shortDay: shortDays[index],
    count: invoices.filter((invoice) => new Date(`${invoice.issueDate}T12:00:00`).getDay() === index).length,
  }));
  const maximum = Math.max(...activity.map((item) => item.count), 1);
  const mostActive = activity.reduce((current, item) => item.count > current.count ? item : current, activity[0]);
  const activeCustomers = customers.filter((customer) => customer.status === "active").length;
  const activeRate = customers.length === 0 ? 0 : Math.round((activeCustomers / customers.length) * 100);
  const target = 80;

  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-1">
      <article className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
        <div className="flex items-center justify-between gap-3">
          <div><h3 className="text-xs font-extrabold text-slate-900">أكثر الأيام نشاطًا</h3><p className="mt-1 text-[9px] text-slate-400">{mostActive.count > 0 ? `${mostActive.day} · ${mostActive.count} فواتير` : "لا توجد حركة بعد"}</p></div>
          <button type="button" aria-label="خيارات النشاط" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50"><MoreHorizontal size={16} /></button>
        </div>

        <div className="mt-5 flex h-[118px] items-end justify-between gap-2" dir="rtl">
          {activity.map((item) => {
            const isMostActive = item.count === maximum && item.count > 0;
            const height = Math.max(20, Math.round((item.count / maximum) * 88));
            return (
              <div key={item.day} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <span className={`text-[9px] font-bold ${isMostActive ? "text-blue-600" : "text-slate-400"}`}>{item.count || ""}</span>
                <span className={`w-full max-w-7 rounded-t-lg transition-colors ${isMostActive ? "bg-blue-600 shadow-[0_6px_14px_rgba(37,99,235,.22)]" : "bg-slate-100"}`} style={{ height }} />
                <span className={`truncate text-[8px] ${isMostActive ? "font-bold text-blue-600" : "text-slate-400"}`}>{item.shortDay}</span>
              </div>
            );
          })}
        </div>
      </article>

      <article className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
        <div className="flex items-center justify-between gap-3"><div><h3 className="text-xs font-extrabold text-slate-900">معدل العملاء النشطين</h3><p className="mt-1 text-[9px] text-slate-400">قياس نشاط قاعدة العملاء</p></div><MoreHorizontal size={16} className="text-slate-400" /></div>

        <div className="relative mx-auto mt-3 h-[118px] max-w-[210px]">
          <svg viewBox="0 0 200 112" className="h-full w-full overflow-visible" aria-hidden="true">
            <path d="M 20 98 A 80 80 0 0 1 180 98" fill="none" stroke="#e8edf3" strokeWidth="14" strokeLinecap="butt" pathLength="100" />
            <path d="M 20 98 A 80 80 0 0 1 180 98" fill="none" stroke="#34d399" strokeWidth="14" strokeLinecap="butt" pathLength="100" strokeDasharray={`${activeRate} 100`} />
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center"><p className="text-[30px] font-black tracking-tight text-slate-950 tabular-nums">{activeRate}%</p><p className="mt-0.5 text-[8px] text-slate-400">الهدف التشغيلي {target}%</p></div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[9px]"><span className="text-slate-500">عملاء نشطون</span><span className="font-extrabold text-slate-800">{activeCustomers} من {customers.length}</span></div>
      </article>
    </div>
  );
}
