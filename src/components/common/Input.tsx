import { useId, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, className = "", id, ...props }: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-600">
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`w-full rounded-xl border bg-white px-4 py-3 outline-none transition placeholder:text-gray-400 focus:ring-4 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-50"
            : "border-gray-200 focus:border-blue-500 focus:ring-blue-50"
        } ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />

      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
