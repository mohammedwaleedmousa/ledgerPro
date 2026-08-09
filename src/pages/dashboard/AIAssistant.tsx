import AIHeader from "../../components/ai/AIHeader";
import AIInsight from "../../components/ai/AIInsight";
import AIChat from "../../components/ai/AIChat";
import SuggestedQuestions from "../../components/ai/SuggestedQuestions";

export default function AIAssistant() {
  return (
    <div className="space-y-6">
      <AIHeader />

      <SuggestedQuestions />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AIInsight />

        <AIChat />
      </div>
    </div>
  );
}