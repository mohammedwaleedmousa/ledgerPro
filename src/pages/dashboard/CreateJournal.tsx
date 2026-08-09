import JournalForm from "../../components/accounting/JournalForm";

export default function CreateJournal() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          إنشاء قيد يومي
        </h1>

        <p className="mt-2 text-gray-500">
          تسجيل عملية مالية جديدة
        </p>
      </div>

      <JournalForm />
    </div>
  );
}