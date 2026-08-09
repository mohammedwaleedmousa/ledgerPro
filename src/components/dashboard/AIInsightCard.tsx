import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useErp } from "../../context/ErpContext";
import { formatCurrency } from "../../lib/format";
import { appPaths } from "../../routes/navigation";

export default function AIInsightCard() {
  const { products, invoices } = useErp();
  const lowStock = products.filter((product) => product.stock <= product.lowStockThreshold);
  const outstanding = invoices.filter((invoice) => invoice.status !== "paid").reduce((sum, invoice) => sum + invoice.total, 0);
  const insight = lowStock.length > 0
    ? `لديك ${lowStock.length} منتجات وصلت إلى حد المخزون المنخفض. راجع المخزون لتجنب توقف المبيعات.`
    : `وضع المخزون جيد. إجمالي المبالغ غير المحصلة حاليًا هو ${formatCurrency(outstanding)}.`;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-500 p-6 text-white shadow-lg">
      <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20"><Sparkles size={20} /></div><h3 className="text-lg font-semibold">التحليل الذكي</h3></div>
      <p className="mt-5 leading-8 text-white/90">{insight}</p>
      <Link to={appPaths.ai} className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-medium text-blue-600 transition hover:bg-gray-100">تحدث مع المساعد</Link>
    </div>
  );
}
