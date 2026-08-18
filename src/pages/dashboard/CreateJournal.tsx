import { ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import { useAuth } from "../../context/AuthContext";
import { useErp } from "../../context/ErpContext";
import { apiRequest } from "../../lib/api";
import { formatCurrency } from "../../lib/format";
import { appPaths } from "../../routes/navigation";
import type { Account } from "../../types/erp";

type DraftLine = { id: string; accountId: string; debit: string; credit: string };

function lineId() {
  return globalThis.crypto?.randomUUID?.() ?? `line-${Date.now()}-${Math.random()}`;
}

export default function CreateJournal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const erp = useErp();
  const isProduction = user?.mode === "supabase";
  const [productionAccounts, setProductionAccounts] = useState<Account[]>([]);
  const accounts = isProduction ? productionAccounts : erp.accounts;
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<DraftLine[]>(() => [
    { id: lineId(), accountId: "", debit: "", credit: "" },
    { id: lineId(), accountId: "", debit: "", credit: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isProduction);
  const totalDebit = useMemo(() => lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0), [lines]);
  const totalCredit = useMemo(() => lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0), [lines]);
  const balanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.001;

  useEffect(() => {
    if (!isProduction) return;
    let active = true;
    setLoading(true);
    apiRequest<Account[]>("/journal/accounts")
      .then((rows) => { if (active) { setProductionAccounts(rows); setError(null); } })
      .catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : "تعذر تحميل دليل الحسابات."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isProduction]);

  function updateLine(id: string, field: "accountId" | "debit" | "credit", value: string) {
    setLines((current) => current.map((line) => {
      if (line.id !== id) return line;
      if (field === "debit") return { ...line, debit: value, credit: Number(value) > 0 ? "" : line.credit };
      if (field === "credit") return { ...line, credit: value, debit: Number(value) > 0 ? "" : line.debit };
      return { ...line, accountId: value };
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { date, description, lines: lines.map((line) => ({ accountId: line.accountId, debit: Number(line.debit) || 0, credit: Number(line.credit) || 0 })) };
      if (isProduction) await apiRequest("/journal", { method: "POST", body: JSON.stringify(payload) });
      else erp.createJournalEntry(payload);
      navigate(appPaths.journal, { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ القيد.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="إنشاء قيد يومي" description="أضف سطرين أو أكثر؛ لن يسمح النظام بترحيل قيد غير متوازن." eyebrow="المحاسبة" actions={<Link to={appPaths.journal} className="inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700"><ArrowRight size={15} />العودة للقيود</Link>} />
      {loading && <Card className="text-center text-xs text-slate-500">جارٍ تحميل دليل الحسابات...</Card>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>{error && <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] font-medium text-rose-700">{error}</div>}<div className="grid gap-4 md:grid-cols-[220px_1fr]"><Input label="تاريخ القيد" type="date" value={date} onChange={(event) => setDate(event.target.value)} required /><Input label="وصف العملية" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="مثال: إثبات تسوية محاسبية" required /></div></Card>
        <Card className="p-0 sm:p-0"><div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center"><div><h2 className="text-sm font-black text-slate-900">سطور القيد</h2><p className="mt-1 text-[10px] text-slate-400">القيد المرحّل لا يعدّل؛ التصحيح يتم بقيد عكسي.</p></div><Button size="sm" variant="secondary" onClick={() => setLines((current) => [...current, { id: lineId(), accountId: "", debit: "", credit: "" }])}><Plus size={13} />إضافة سطر</Button></div>
          <Table minWidth="640px" className="rounded-none border-0 shadow-none"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-3.5">الحساب</th><th className="w-44 p-3.5">مدين</th><th className="w-44 p-3.5">دائن</th><th className="w-16 p-3.5">حذف</th></tr></thead><tbody>{lines.map((line) => <tr key={line.id} className="border-b border-slate-100 last:border-0"><td className="p-3"><select aria-label="الحساب" value={line.accountId} onChange={(event) => updateLine(line.id, "accountId", event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500" required><option value="">اختر الحساب</option>{accounts.filter((account) => account.isActive).map((account) => <option key={account.id} value={account.id}>{account.code} · {account.name}</option>)}</select></td><td className="p-3"><input aria-label="مدين" type="number" min="0" step="0.01" value={line.debit} onChange={(event) => updateLine(line.id, "debit", event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 px-3 text-xs outline-none" /></td><td className="p-3"><input aria-label="دائن" type="number" min="0" step="0.01" value={line.credit} onChange={(event) => updateLine(line.id, "credit", event.target.value)} className="min-h-10 w-full rounded-[10px] border border-slate-200 px-3 text-xs outline-none" /></td><td className="p-3 text-center"><button type="button" aria-label="حذف السطر" disabled={lines.length <= 2} onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 disabled:opacity-30"><Trash2 size={14} /></button></td></tr>)}</tbody></Table>
          <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center"><div className="flex flex-wrap gap-5 text-xs"><p className="text-slate-500">إجمالي المدين <strong className="mr-2 text-slate-900">{formatCurrency(totalDebit)}</strong></p><p className="text-slate-500">إجمالي الدائن <strong className="mr-2 text-slate-900">{formatCurrency(totalCredit)}</strong></p><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${balanced ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{balanced ? "القيد متوازن" : `الفرق ${formatCurrency(Math.abs(totalDebit - totalCredit))}`}</span></div><Button type="submit" loading={saving} disabled={!balanced || accounts.length < 2 || loading}><Save size={14} />ترحيل القيد</Button></div>
        </Card>
      </form>
    </div>
  );
}
