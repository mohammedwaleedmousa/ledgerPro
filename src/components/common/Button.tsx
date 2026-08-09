import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  loading = false,
  disabled,
  ...props
}: Props) {
  const styles = {
    primary: "border border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-200/70 hover:border-blue-700 hover:bg-blue-700 focus-visible:ring-blue-100",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700 focus-visible:ring-slate-100",
    danger: "border border-rose-600 bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-100",
    ghost: "border border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-100",
  };
  const sizes = {
    sm: "min-h-8 rounded-lg px-3 py-1.5 text-[10px]",
    md: "min-h-10 rounded-[10px] px-4 py-2.5 text-xs",
    lg: "min-h-11 rounded-xl px-5 py-3 text-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${sizes[size]} ${styles[variant]} ${className}`}
      {...props}
    >
      {loading ? "جاري التنفيذ..." : children}
    </button>
  );
}
