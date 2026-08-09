import type { LucideIcon } from "lucide-react";

type Tone = "blue" | "emerald" | "amber" | "rose" | "slate";

type Props = {
  title: string;
  value: string;
  icon: LucideIcon;
  meta?: string;
  tone?: Tone;
};

const tones: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  slate: "bg-slate-100 text-slate-600",
};

export default function StatCard({ title, value, icon: Icon, meta, tone = "blue" }: Props) {
  return (
    <article className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold text-slate-600">{title}</p><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}><Icon size={15} /></span></div>
      <p className="mt-3 truncate text-[25px] font-black tracking-tight text-slate-950 tabular-nums">{value}</p>
      {meta && <p className="mt-2 truncate text-[9px] text-slate-400">{meta}</p>}
    </article>
  );
}
