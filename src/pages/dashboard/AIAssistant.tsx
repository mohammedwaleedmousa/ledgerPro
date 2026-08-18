import { Bot, CircleDollarSign, PackageSearch, Send, Sparkles, TriangleAlert, Users } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";

type Message = { id: string; role: "assistant" | "user"; text: string };

const questions = [
  "ما صافي الربح الحالي؟",
  "ما أكثر منتج مبيعاً؟",
  "ما المنتجات منخفضة المخزون؟",
  "كم المبالغ المستحقة من العملاء؟",
];

function messageId() {
  return globalThis.crypto?.randomUUID?.() ?? `message-${Date.now()}-${Math.random()}`;
}

export default function AIAssistant() {
  const { invoices, expenses, products, customers, salesReturns, payments } = useErp();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", role: "assistant", text: "مرحباً، أستطيع تحليل المبيعات والربحية والمخزون والذمم من بيانات LedgerPro الحالية." }]);
  const analytics = useMemo(() => {
    const postedInvoices = invoices.filter((invoice) => invoice.status !== "draft");
    const returnedIds = new Set(salesReturns.map((item) => item.invoiceId));
    const revenue = postedInvoices.reduce((sum, invoice) => sum + invoice.total, 0) - salesReturns.reduce((sum, item) => sum + item.amount, 0);
    const cogs = postedInvoices.filter((invoice) => !returnedIds.has(invoice.id)).reduce((sum, invoice) => sum + invoice.items.reduce((itemSum, item) => itemSum + item.unitCost * item.quantity, 0), 0);
    const paidExpenses = expenses.filter((expense) => expense.status === "paid").reduce((sum, expense) => sum + expense.amount, 0);
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    postedInvoices.filter((invoice) => !returnedIds.has(invoice.id)).forEach((invoice) => invoice.items.forEach((item) => {
      const current = productSales.get(item.productId) ?? { name: item.productName, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += item.total;
      productSales.set(item.productId, current);
    }));
    const lowStock = products.filter((product) => product.stock <= product.lowStockThreshold);
    const outstanding = customers.reduce((sum, customer) => sum + customer.balance, 0);
    const receipts = payments.filter((payment) => payment.direction === "receipt").reduce((sum, payment) => sum + payment.amount, 0);
    const disbursements = payments.filter((payment) => payment.direction === "payment").reduce((sum, payment) => sum + payment.amount, 0);
    return { revenue, netProfit: revenue - cogs - paidExpenses, lowStock, outstanding, topProduct: [...productSales.values()].sort((a, b) => b.revenue - a.revenue)[0], netCash: receipts - disbursements };
  }, [customers, expenses, invoices, payments, products, salesReturns]);

  function answerFor(value: string) {
    const normalized = value.trim().toLowerCase();
    if (normalized.includes("ربح") || normalized.includes("صافي")) return `صافي الربح التشغيلي التقديري هو ${formatCurrency(analytics.netProfit)}، بعد خصم تكلفة المنتجات والمصروفات المدفوعة من صافي الإيرادات.`;
    if (normalized.includes("منتج") && (normalized.includes("أكثر") || normalized.includes("أفضل") || normalized.includes("مبيع"))) return analytics.topProduct ? `${analytics.topProduct.name} هو الأعلى مبيعاً بكمية ${formatNumber(analytics.topProduct.quantity)} وإيراد ${formatCurrency(analytics.topProduct.revenue)}.` : "لا توجد مبيعات مرحّلة كافية لتحديد المنتج الأعلى مبيعاً.";
    if (normalized.includes("مخزون") || normalized.includes("منخفض")) return analytics.lowStock.length ? `يوجد ${formatNumber(analytics.lowStock.length)} منتجات عند حد التنبيه أو أقل: ${analytics.lowStock.map((product) => `${product.name} (${formatNumber(product.stock)})`).join("، ")}.` : "لا توجد منتجات منخفضة المخزون حالياً.";
    if (normalized.includes("مستحق") || normalized.includes("عملاء") || normalized.includes("ذمم")) return `إجمالي أرصدة العملاء غير المحصلة حالياً هو ${formatCurrency(analytics.outstanding)}.`;
    if (normalized.includes("سيول") || normalized.includes("نقد") || normalized.includes("تدفق")) return `صافي سندات القبض والصرف المسجلة هو ${formatCurrency(analytics.netCash)}.`;
    if (normalized.includes("إيراد") || normalized.includes("مبيعات")) return `صافي الإيرادات المرحّلة بعد المرتجعات هو ${formatCurrency(analytics.revenue)}.`;
    return `ملخص الأداء الحالي: صافي الإيرادات ${formatCurrency(analytics.revenue)}، صافي الربح التقديري ${formatCurrency(analytics.netProfit)}، ومستحقات العملاء ${formatCurrency(analytics.outstanding)}. يمكنك سؤالي عن الربحية أو المنتجات أو المخزون أو السيولة.`;
  }

  function ask(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setMessages((current) => [...current, { id: messageId(), role: "user", text: clean }, { id: messageId(), role: "assistant", text: answerFor(clean) }]);
    setQuestion("");
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Ledger Insights" description="مساعد تحليلي يقرأ مؤشرات شركتك الحالية ويحوّلها إلى إجابات واضحة." eyebrow="المساعد الذكي" actions={<Badge variant="info">تحليل محلي آمن</Badge>} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><CircleDollarSign size={16} /></span><div><p className="text-[9px] text-slate-400">صافي الربح</p><p className="mt-1 text-sm font-black">{formatCurrency(analytics.netProfit)}</p></div></Card>
        <Card className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><PackageSearch size={16} /></span><div className="min-w-0"><p className="text-[9px] text-slate-400">الأعلى مبيعاً</p><p className="mt-1 truncate text-sm font-black">{analytics.topProduct?.name ?? "لا توجد بيانات"}</p></div></Card>
        <Card className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><TriangleAlert size={16} /></span><div><p className="text-[9px] text-slate-400">تنبيهات المخزون</p><p className="mt-1 text-sm font-black">{formatNumber(analytics.lowStock.length)}</p></div></Card>
        <Card className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Users size={16} /></span><div><p className="text-[9px] text-slate-400">ذمم العملاء</p><p className="mt-1 text-sm font-black">{formatCurrency(analytics.outstanding)}</p></div></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)]">
        <Card className="flex min-h-[510px] flex-col p-0 sm:p-0">
          <div className="flex items-center gap-3 border-b border-slate-100 p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white"><Bot size={17} /></span><div><h2 className="text-xs font-black text-slate-900">المحادثة التحليلية</h2><p className="mt-1 text-[9px] text-slate-400">الإجابات مبنية على بيانات شركتك داخل هذه الجلسة</p></div></div>
          <div className="app-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4">{messages.map((message) => <div key={message.id} className={`flex ${message.role === "user" ? "justify-start" : "justify-end"}`}><div className={`max-w-[86%] rounded-2xl px-4 py-3 text-[11px] leading-6 ${message.role === "user" ? "rounded-tr-sm bg-blue-600 text-white" : "rounded-tl-sm border border-slate-200 bg-white text-slate-700"}`}>{message.text}</div></div>)}</div>
          <form onSubmit={(event) => { event.preventDefault(); ask(question); }} className="flex gap-2 border-t border-slate-100 bg-white p-3"><input aria-label="اسأل المساعد" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="اسأل عن الربحية أو المخزون..." className="min-h-10 min-w-0 flex-1 rounded-[10px] border border-slate-200 px-3 text-xs outline-none focus:border-blue-500" /><Button type="submit" disabled={!question.trim()}><Send size={14} />إرسال</Button></form>
        </Card>

        <div className="space-y-4">
          <Card><div className="flex items-center gap-2"><Sparkles size={16} className="text-blue-600" /><h2 className="text-xs font-black">أسئلة مقترحة</h2></div><div className="mt-4 space-y-2">{questions.map((item) => <button type="button" key={item} onClick={() => ask(item)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3 text-right text-[10px] font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">{item}</button>)}</div></Card>
          <Card className="border-blue-100 bg-blue-50/60"><h2 className="text-xs font-black text-blue-900">حدود النسخة الحالية</h2><p className="mt-2 text-[10px] leading-6 text-blue-700">التحليل الحالي حسابي وحتمي ولا يرسل بياناتك إلى نموذج خارجي. المحادثة التوليدية الحقيقية تحتاج خدمة NestJS آمنة وسياسة واضحة لحماية بيانات كل شركة.</p></Card>
        </div>
      </div>
    </div>
  );
}
