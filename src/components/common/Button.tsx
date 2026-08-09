import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  loading = false,
  disabled,
  ...props
}: Props) {
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-200",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-200",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`rounded-xl px-5 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {loading ? "جاري التنفيذ..." : children}
    </button>
  );
}
