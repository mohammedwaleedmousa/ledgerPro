const questions = [
  "ما صافي الربح هذا الشهر؟",
  "ما أكثر منتج مبيعاً؟",
  "هل يوجد انخفاض في المبيعات؟",
  "ما توقعات الشهر القادم؟",
];

export default function SuggestedQuestions() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {questions.map((question) => (
        <button
          key={question}
          className="rounded-2xl border border-gray-100 bg-white p-4 text-right transition hover:border-blue-400 hover:text-blue-600"
        >
          {question}
        </button>
      ))}
    </div>
  );
}