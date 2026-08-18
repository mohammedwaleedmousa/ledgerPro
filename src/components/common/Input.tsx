import { useId, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, className = "", id, ...props }: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-[11px] font-bold text-slate-600">
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`min-h-10 w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-50"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
        } ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />

      {error && (
        <p id={`${inputId}-error`} className="text-[10px] font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
