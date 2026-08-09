import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
};

export default function PageHeader({ title, description, eyebrow, actions }: Props) {
  return (
    <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[9px] font-black tracking-[0.16em] text-blue-600">{eyebrow}</p>}
        <h1 className="text-[23px] font-black tracking-tight text-slate-950 sm:text-[25px]">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-[11px] leading-5 text-slate-500">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
