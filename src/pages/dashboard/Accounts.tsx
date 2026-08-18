import { CircleDollarSign, Landmark, Plus, Scale, Search, WalletCards, X } from "lucide-react";
import { useState } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Table from "../../components/common/Table";
import { useErp } from "../../context/ErpContext";
import { formatCurrency, formatNumber } from "../../lib/format";
import type { AccountType } from "../../types/erp";

const typeLabels: Record<AccountType, string> = { asset: "أصل", liability: "التزام", equity: "حقوق ملكية", revenue: "إيراد", expense: "مصروف" };
const typeVariants: Record<AccountType, "success" | "warning" | "danger" | "info" | "neutral"> = { asset: "info", liability: "warning", equity: "neutral", revenue: "success", expense: "danger" };

export default function Accounts() {
  const { accounts, addAccount } = useErp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("asset");
  const [error, setError] = useState<string | null>(null);
  const assets = accounts.filter((account) => account.type === "asset").reduce((sum, account) => sum + account.balance, 0);
  const liabilities = accounts.filter((account) => account.type === "liability").reduce((sum, account) => sum + account.balance, 0);
  const equity = accounts.filter((account) => account.type === "equity").reduce((sum, account) => sum + account.balance, 0);
  const normalized = search.trim().toLowerCase();
  const filtered = accounts.filter((account) => !normalized || account.name.toLowerCase().includes(normalized) || account.code.toLowerCase().includes(normalized) || typeLabels[account.type].includes(normalized));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      addAccount({ code, name, type });
      setCode(""); setName(""); setError(null); setShowForm(false);
    } catch (accountError) {
      setError(accountError instanceof Error ? accountError.message : "تعذر إضافة الحساب.");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="دليل الحسابات" description="هيكل الحسابات الذي تعتمد عليه القيود والتقارير المالية." eyebrow="المحاسبة" actions={<Button onClick={() => setShowForm((current) => !current)}>{showForm ? <X size={15} /> : <Plus size={15} />}{showForm ? "إغلاق" : "إضافة حساب"}</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard title="إجمالي الحسابات" value={formatNumber(accounts.length)} icon={Landmark} /><StatCard title="الأصول" value={formatCurrency(assets)} icon={WalletCards} /><StatCard title="الالتزامات" value={formatCurrency(liabilities)} icon={Scale} tone="amber" /><StatCard title="حقوق الملكية" value={formatCurrency(equity)} icon={CircleDollarSign} tone="emerald" /></div>

      {showForm && <form onSubmit={handleSubmit}><Card>{error && <div className="mb-4 rounded-xl bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}<div className="grid gap-4 md:grid-cols-[180px_1fr_220px_auto] md:items-end"><Input label="رمز الحساب" value={code} onChange={(event) => setCode(event.target.value)} placeholder="1101" required /><Input label="اسم الحساب" value={name} onChange={(event) => setName(event.target.value)} required /><div className="space-y-1.5"><label htmlFor="account-type" className="block text-[11px] font-bold text-slate-600">النوع</label><select id="account-type" value={type} onChange={(event) => setType(event.target.value as AccountType)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none">{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><Button type="submit"><Plus size={15} />حفظ</Button></div></Card></form>}

      <Card className="p-3 sm:p-4"><label className="flex h-10 max-w-md items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3"><Search size={15} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="الرمز أو اسم الحساب..." className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label></Card>
      <Table minWidth="700px"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">الرمز</th><th className="p-4">الحساب</th><th className="p-4">النوع</th><th className="p-4">الرصيد</th><th className="p-4">الحالة</th></tr></thead><tbody>{filtered.map((account) => <tr key={account.id} className="border-b border-slate-100 last:border-0"><td className="p-4 font-mono text-[11px] font-bold text-blue-700">{account.code}</td><td className="p-4 text-xs font-bold text-slate-800">{account.name}</td><td className="p-4"><Badge variant={typeVariants[account.type]}>{typeLabels[account.type]}</Badge></td><td className="p-4 text-xs font-extrabold text-slate-900">{formatCurrency(account.balance)}</td><td className="p-4"><Badge>{account.isActive ? "نشط" : "متوقف"}</Badge></td></tr>)}{filtered.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-xs text-slate-400">لا توجد حسابات مطابقة.</td></tr>}</tbody></Table>
    </div>
  );
}
