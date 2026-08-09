type Props = {
  label?: string;
  placeholder?: string;
  type?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({
  label,
  placeholder,
  type = "text",
  onChange,
}: Props) {

  return (
    <div className="space-y-2">

      {label && (
        <label className="text-sm text-gray-500">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
      />

    </div>
  );
}