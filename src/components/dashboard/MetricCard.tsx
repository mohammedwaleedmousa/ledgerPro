import { ArrowDownLeft, ArrowUpLeft } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
  positive?: boolean;
  hint?: string;
};

export default function MetricCard({ title, value, change, icon, positive = true, hint = "مقارنة بالفترة السابقة" }: Props) {
  const TrendIcon = positive ? ArrowUpLeft : ArrowDownLeft;

  return (
    <article className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-600">{title}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 [&_svg]:h-4 [&_svg]:w-4">{icon}</div>
      </div>

      <h2 className="mt-3 truncate text-[26px] font-extrabold leading-none tracking-tight text-slate-950 tabular-nums">{value}</h2>

      <div className="mt-3 flex min-w-0 items-center gap-2">
        <span className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-[10px] font-bold ${positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
          <TrendIcon size={11} aria-hidden="true" />
          {change}
        </span>
        <span className="truncate text-[9px] text-slate-400">{hint}</span>
      </div>
    </article>
  );
}
