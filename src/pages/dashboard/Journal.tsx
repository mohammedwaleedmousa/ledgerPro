import { BookOpenCheck, CircleDollarSign, FilePlus2, RotateCcw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Table from "../../components/common/Table";
import { useAuth } from "../../context/AuthContext";
import { useErp } from "../../context/ErpContext";
import { apiRequest } from "../../lib/api";
import { formatCurrency, formatDate, formatNumber } from "../../lib/format";
import { appPaths } from "../../routes/navigation";
import type { JournalEntry } from "../../types/erp";

export default function Journal() {
  const { user } = useAuth();
  const erp = useErp();
  const isProduction = user?.mode === "supabase";
  const [productionEntries, setProductionEntries] = useState<JournalEntry[]>([]);
  const journalEntries = isProduction ? productionEntries : erp.journalEntries;
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isProduction);
  const [reversingId, setReversingId] = useState<string | null>(null);

  async function loadEntries() {
    if (!isProduction) return;
    setLoading(true);
    try {
      setProductionEntries(await apiRequest<JournalEntry[]>("/journal?limit=100"));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "تعذر تحميل القيود اليومية.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadEntries(); }, [isProduction]);

  const normalized = search.trim().toLowerCase();
  const entries = useMemo(() => journalEntries.filter((entry) => !normalized || entry.number.toLowerCase().includes(normalized) || entry.description.toLowerCase().includes(normalized)), [journalEntries, normalized]);
  const totalPosted = journalEntries.filter((entry) => entry.status === "posted").reduce((sum, entry) => sum + entry.totalDebit, 0);

  async function handleReverse(entry: JournalEntry) {
    const reason = window.prompt(`سبب عكس القيد ${entry.number}:`);
    if (!reason?.trim()) return;
    setReversingId(entry.id);
    try {
      await apiRequest(`/journal/${entry.id}/reverse`, { method: "POST", body: JSON.stringify({ reason: reason.trim() }) });
      await loadEntries();
      setError(null);
    } catch (reverseError) {
      setError(reverseError instanceof Error ? reverseError.message : "تعذر عكس القيد.");
    } finally {
      setReversingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="القيود اليومية" description="راجع القيود المتوازنة ورحّل عمليات محاسبية جديدة." eyebrow="المحاسبة" actions={<Link to={appPaths.createJournal} className="inline-flex min-h-10 items-center gap-2 rounded-[10px] bg-blue-600 px-4 text-xs font-bold text-white shadow-sm shadow-blue-200"><FilePlus2 size={15} />إنشاء قيد</Link>} />
      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-[11px] font-bold text-rose-700">{error}</div>}
      <div className="grid gap-3 md:grid-cols-3"><StatCard title="عدد القيود" value={formatNumber(journalEntries.length)} icon={BookOpenCheck} /><StatCard title="إجمالي الحركة المرحلة" value={formatCurrency(totalPosted)} icon={CircleDollarSign} /><StatCard title="قيود معكوسة" value={formatNumber(journalEntries.filter((entry) => entry.status === "reversed").length)} icon={RotateCcw} tone="amber" /></div>
      <Card className="p-3 sm:p-4"><label className="flex h-10 max-w-md items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3"><Search size={15} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="رقم القيد أو الوصف..." className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label></Card>
      {loading ? <Card className="text-center text-xs text-slate-500">جارٍ تحميل القيود...</Card> : <Table minWidth="860px"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">الرقم</th><th className="p-4">التاريخ</th><th className="p-4">الوصف</th><th className="p-4">السطور</th><th className="p-4">مدين</th><th className="p-4">دائن</th><th className="p-4">الحالة</th><th className="p-4">الإجراء</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id} className="border-b border-slate-100 last:border-0"><td className="p-4 font-mono text-[11px] font-bold text-blue-700">{entry.number}</td><td className="p-4 text-[10px] text-slate-500">{formatDate(entry.date)}</td><td className="max-w-72 truncate p-4 text-xs font-bold text-slate-700">{entry.description}</td><td className="p-4 text-[10px] text-slate-500">{entry.lines.length}</td><td className="p-4 text-xs font-extrabold">{formatCurrency(entry.totalDebit)}</td><td className="p-4 text-xs font-extrabold">{formatCurrency(entry.totalCredit)}</td><td className="p-4"><Badge variant={entry.status === "reversed" ? "warning" : "success"}>{entry.status === "reversed" ? "معكوس" : "مرحّل"}</Badge></td><td className="p-4">{isProduction && entry.isManual && entry.status === "posted" ? <Button size="sm" variant="secondary" loading={reversingId === entry.id} onClick={() => void handleReverse(entry)}><RotateCcw size={13} />عكس القيد</Button> : <span className="text-[9px] text-slate-400">—</span>}</td></tr>)}{entries.length === 0 && <tr><td colSpan={8} className="p-12 text-center text-xs text-slate-400">لا توجد قيود مطابقة.</td></tr>}</tbody></Table>}
    </div>
  );
}
