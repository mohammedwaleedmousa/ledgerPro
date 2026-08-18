import { BookOpenCheck, CircleDollarSign, FilePlus2, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Table from "../../components/common/Table";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatDate, formatNumber } from "../../lib/format";
import { appPaths } from "../../routes/navigation";

export default function Journal() {
  const { journalEntries } = useErp();
  const [search, setSearch] = useState("");
  const normalized = search.trim().toLowerCase();
  const entries = journalEntries.filter((entry) => !normalized || entry.number.toLowerCase().includes(normalized) || entry.description.toLowerCase().includes(normalized));
  const totalPosted = journalEntries.reduce((sum, entry) => sum + entry.totalDebit, 0);

  return (
    <div className="space-y-4">
      <PageHeader title="القيود اليومية" description="راجع القيود المتوازنة ورحّل عمليات محاسبية جديدة." eyebrow="المحاسبة" actions={<Link to={appPaths.createJournal} className="inline-flex min-h-10 items-center gap-2 rounded-[10px] bg-blue-600 px-4 text-xs font-bold text-white shadow-sm shadow-blue-200"><FilePlus2 size={15} />إنشاء قيد</Link>} />
      <div className="grid gap-3 md:grid-cols-3"><StatCard title="عدد القيود" value={formatNumber(journalEntries.length)} icon={BookOpenCheck} /><StatCard title="إجمالي الحركة المدينة" value={formatCurrency(totalPosted)} icon={CircleDollarSign} /><StatCard title="قيود غير متوازنة" value="٠" icon={BookOpenCheck} tone="emerald" meta="يمنع النظام حفظها" /></div>
      <Card className="p-3 sm:p-4"><label className="flex h-10 max-w-md items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3"><Search size={15} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="رقم القيد أو الوصف..." className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label></Card>
      <Table minWidth="760px"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">الرقم</th><th className="p-4">التاريخ</th><th className="p-4">الوصف</th><th className="p-4">السطور</th><th className="p-4">مدين</th><th className="p-4">دائن</th><th className="p-4">الحالة</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id} className="border-b border-slate-100 last:border-0"><td className="p-4 font-mono text-[11px] font-bold text-blue-700">{entry.number}</td><td className="p-4 text-[10px] text-slate-500">{formatDate(entry.date)}</td><td className="max-w-72 truncate p-4 text-xs font-bold text-slate-700">{entry.description}</td><td className="p-4 text-[10px] text-slate-500">{entry.lines.length}</td><td className="p-4 text-xs font-extrabold">{formatCurrency(entry.totalDebit)}</td><td className="p-4 text-xs font-extrabold">{formatCurrency(entry.totalCredit)}</td><td className="p-4"><Badge>مرحّل</Badge></td></tr>)}{entries.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-xs text-slate-400">لا توجد قيود مطابقة.</td></tr>}</tbody></Table>
    </div>
  );
}
