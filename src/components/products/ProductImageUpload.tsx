import { Upload } from "lucide-react";

export default function ProductImageUpload() {
  return (
    <div className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-slate-200 bg-white transition hover:border-blue-300 hover:bg-blue-50/30">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Upload size={18} /></span>

      <p className="mt-3 text-[11px] font-bold text-slate-600">
        رفع صورة المنتج
      </p>

      <p className="mt-1 text-[9px] text-slate-400">
        PNG, JPG حتى 5MB
      </p>
    </div>
  );
}
