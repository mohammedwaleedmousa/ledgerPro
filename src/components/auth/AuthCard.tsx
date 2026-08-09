import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title: string;
  description: string;
};

export default function AuthCard({ children, title, description }: Props) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-950 p-4 sm:p-6" dir="rtl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.28),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(79,70,229,0.2),_transparent_34%)]" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 shadow-2xl shadow-blue-950/30 sm:p-8">
        <div className="mb-8">
          <p className="text-2xl font-extrabold text-blue-600">LedgerPro</p>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-gray-500">{description}</p>
        </div>

        {children}
      </div>
    </main>
  );
}
