import Card from "../common/Card";

export default function AIChat() {
  return (
    <Card>
      <h3 className="text-lg font-bold">
        المحادثة مع Ledger AI
      </h3>

      <div className="mt-5 h-64 rounded-2xl bg-gray-50 p-5 text-gray-500">
        اكتب سؤالك المالي هنا...
      </div>

      <div className="mt-4 flex gap-3">
        <input
          placeholder="اسأل عن بيانات شركتك..."
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none"
        />

        <button className="rounded-xl bg-blue-600 px-6 text-white">
          إرسال
        </button>
      </div>
    </Card>
  );
}