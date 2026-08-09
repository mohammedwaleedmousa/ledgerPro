import { Building2, Database, RefreshCcw, Save, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { useCompany } from "../../context/CompanyContext";
import { useErp } from "../../context/ErpContext";
import type { CompanySettings } from "../../types/erp";

const currencyLabels: Record<CompanySettings["currency"], string> = { USD: "دولار أمريكي (USD)", YER: "ريال يمني (YER)", SAR: "ريال سعودي (SAR)" };

export default function Settings() {
  const { user, isSupabaseConfigured } = useAuth();
  const { company } = useCompany();
  const { settings, updateSettings, resetDemoData } = useErp();
  const [draft, setDraft] = useState(settings);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      updateSettings(draft);
      setError(null);
      setMessage("تم حفظ إعدادات الشركة وتحديث تنسيق العملة.");
    } catch (saveError) {
      setMessage(null);
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ الإعدادات.");
    }
  }

  function handleReset() {
    if (!window.confirm("سيتم حذف تعديلات التجربة وإعادة البيانات الافتراضية. هل تريد المتابعة؟")) return;
    const freshState = resetDemoData();
    setDraft(freshState.settings);
    setError(null);
    setMessage("تمت إعادة بيانات التجربة.");
  }

  const systemChecks = [
    { label: "واجهة الوحدات والمسارات", ready: true, note: "جاهزة للتجربة" },
    { label: "Supabase Auth", ready: isSupabaseConfigured, note: isSupabaseConfigured ? "متغيرات الاتصال موجودة" : "يعمل تسجيل Demo محلياً" },
    { label: "بيانات ERP على PostgreSQL", ready: false, note: "الحالة الحالية محفوظة في المتصفح" },
    { label: "NestJS API والمهام الخلفية", ready: false, note: "غير موجودة في نسخة GitHub الحالية" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="الإعدادات" description="إعدادات الشركة والمستندات والعملة، مع حالة جاهزية التكاملات الإنتاجية." eyebrow="النظام" />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Building2 size={16} /></span><div className="min-w-0"><p className="text-[9px] text-slate-400">الشركة</p><p className="mt-1 truncate text-xs font-black">{company?.name ?? "غير متاحة"}</p><p className="mt-1 text-[9px] text-slate-400">الخطة: {company?.plan ?? "—"}</p></div></Card>
        <Card className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><UserRound size={16} /></span><div className="min-w-0"><p className="text-[9px] text-slate-400">المستخدم</p><p className="mt-1 truncate text-xs font-black">{user?.name ?? "—"}</p><p className="mt-1 truncate text-[9px] text-slate-400">{user?.email ?? "—"}</p></div></Card>
        <Card className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck size={16} /></span><div><p className="text-[9px] text-slate-400">الصلاحية</p><p className="mt-1 text-xs font-black">{user?.role === "owner" ? "مالك الشركة" : user?.role ?? "—"}</p><p className="mt-1 text-[9px] text-slate-400">{user?.mode === "demo" ? "جلسة تجريبية" : "Supabase Auth"}</p></div></Card>
        <Card className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Database size={16} /></span><div><p className="text-[9px] text-slate-400">تخزين بيانات ERP</p><p className="mt-1 text-xs font-black">محلي للتجربة</p><p className="mt-1 text-[9px] text-slate-400">لم يُربط بالجداول بعد</p></div></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
        <form onSubmit={handleSave}>
          <Card>
            <div className="flex items-center justify-between"><div><h2 className="text-sm font-black text-slate-900">إعدادات الشركة والمستندات</h2><p className="mt-1 text-[10px] text-slate-400">تُطبق على المستندات الجديدة والتنسيق المالي.</p></div><Building2 size={18} className="text-blue-600" /></div>
            {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}
            {message && <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-[11px] text-emerald-700">{message}</div>}
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5"><label htmlFor="settings-currency" className="block text-[11px] font-bold text-slate-600">العملة</label><select id="settings-currency" value={draft.currency} onChange={(event) => setDraft((current) => ({ ...current, currency: event.target.value as CompanySettings["currency"] }))} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500">{Object.entries(currencyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              <Input label="نسبة الضريبة الافتراضية %" type="number" min="0" max="100" step="0.01" value={draft.taxRate} onChange={(event) => setDraft((current) => ({ ...current, taxRate: Number(event.target.value) }))} required />
              <Input label="بادئة الفواتير" value={draft.invoicePrefix} onChange={(event) => setDraft((current) => ({ ...current, invoicePrefix: event.target.value }))} placeholder="INV" required />
              <Input label="بادئة عروض الأسعار" value={draft.quotationPrefix} onChange={(event) => setDraft((current) => ({ ...current, quotationPrefix: event.target.value }))} placeholder="QT" required />
              <Input label="بادئة أوامر الشراء" value={draft.purchasePrefix} onChange={(event) => setDraft((current) => ({ ...current, purchasePrefix: event.target.value }))} placeholder="PO" required />
              <Input label="بداية السنة المالية (MM-DD)" value={draft.fiscalYearStart} onChange={(event) => setDraft((current) => ({ ...current, fiscalYearStart: event.target.value }))} placeholder="01-01" pattern="\d{2}-\d{2}" required />
            </div>
            <div className="mt-5 flex flex-wrap gap-2"><Button type="submit"><Save size={14} />حفظ الإعدادات</Button><Button variant="secondary" type="button" onClick={() => { setDraft(settings); setError(null); setMessage(null); }}>إلغاء التعديلات</Button></div>
          </Card>
        </form>

        <div className="space-y-4">
          <Card><div className="flex items-center gap-2"><ShieldCheck size={16} className="text-blue-600" /><h2 className="text-sm font-black">جاهزية التشغيل</h2></div><div className="mt-4 space-y-3">{systemChecks.map((check) => <div key={check.label} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3"><div><p className="text-[10px] font-bold text-slate-700">{check.label}</p><p className="mt-1 text-[9px] text-slate-400">{check.note}</p></div><Badge variant={check.ready ? "success" : "warning"}>{check.ready ? "جاهز" : "مطلوب"}</Badge></div>)}</div></Card>
          <Card className="border-amber-100"><h2 className="text-sm font-black text-slate-900">إعادة ضبط النسخة التجريبية</h2><p className="mt-2 text-[10px] leading-6 text-slate-500">يرجع كل المنتجات والعملاء والفواتير والوحدات الجديدة إلى بيانات البداية. لا يعدّل أي مشروع Supabase.</p><Button size="sm" variant="secondary" className="mt-4" onClick={handleReset}><RefreshCcw size={13} />إعادة البيانات</Button></Card>
        </div>
      </div>
    </div>
  );
}
