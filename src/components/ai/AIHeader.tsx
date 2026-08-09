import { Sparkles } from "lucide-react";

export default function AIHeader() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
          <Sparkles />
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            Ledger AI
          </h1>

          <p className="mt-1 text-white/80">
            مساعدك المالي الذكي
          </p>
        </div>
      </div>
    </div>
  );
}