import { Upload } from "lucide-react";

export default function ProductImageUpload() {
  return (
    <div className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 transition hover:border-blue-400">
      <Upload size={30} className="text-gray-400" />

      <p className="mt-3 text-sm text-gray-500">
        رفع صورة المنتج
      </p>

      <p className="mt-1 text-xs text-gray-400">
        PNG, JPG حتى 5MB
      </p>
    </div>
  );
}