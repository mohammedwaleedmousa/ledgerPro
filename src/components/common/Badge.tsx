type Props = {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
};

export default function Badge({ children, variant = "success" }: Props) {
  const styles = {
    success: "border-emerald-100 bg-emerald-50 text-emerald-700",
    warning: "border-amber-100 bg-amber-50 text-amber-700",
    danger: "border-rose-100 bg-rose-50 text-rose-700",
    info: "border-blue-100 bg-blue-50 text-blue-700",
    neutral: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${styles[variant]}`}>
      {children}
    </span>
  );
}
