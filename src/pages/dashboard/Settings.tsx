import { Building2, Database, RefreshCcw, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useCompany } from "../../context/CompanyContext";
import { useErp } from "../../context/ErpContext";

export default function Settings() {
  const { user, isSupabaseConfigured } = useAuth();
  const { company } = useCompany();
  const { resetDemoData } = useErp();
  const [message, setMessage] = useState<string | null>(null);

  function handleReset() {
    if (!window.confirm("سيتم حذف تعديلات التجربة وإعادة البيانات الافتراضية. هل تريد المتابعة؟")) return;
    resetDemoData();
    setMessage("تمت إعادة بيانات التجربة.");
  }

  const cards = [
    { icon: Building2, title: "الشركة", lines: [company?.name ?? "غير متاحة", `الخطة: ${company?.plan ?? "—"}`] },
    { icon: UserRound, title: "المستخدم", lines: [user?.name ?? "—", user?.email ?? "—"] },
    { icon: ShieldCheck, title: "الدور والصلاحية", lines: [user?.role === "owner" ? "مالك الشركة" : user?.role ?? "—", user?.mode === "demo" ? "جلسة تجريبية محلية" : "جلسة Supabase Auth"] },
    { icon: Database, title: "قاعدة البيانات", lines: [isSupabaseConfigured ? "Supabase مربوط" : "Supabase غير مربوط", isSupabaseConfigured ? "سياسة RLS مطلوبة قبل الإنتاج" : "تعمل بيانات Demo داخل المتصفح"] },
  ];

  return (
    <div className="space-y-6">
      <header><h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1><p className="mt-2 text-gray-500">بيانات الشركة والمستخدم وحالة ربط النظام</p></header>
      <div className="grid gap-5 md:grid-cols-2">{cards.map(({ icon: Icon, title, lines }) => <section key={title} className="rounded-3xl border border-gray-100 bg-white p-6"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={21} /></span><h2 className="font-bold">{title}</h2></div><div className="mt-5 space-y-2">{lines.map((line) => <p key={line} className="text-sm text-gray-500">{line}</p>)}</div></section>)}</div>
      <section className="rounded-3xl border border-amber-100 bg-white p-6"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><h2 className="font-bold text-gray-900">إعادة ضبط النسخة التجريبية</h2><p className="mt-2 text-sm leading-6 text-gray-500">يرجع المنتجات والعملاء والفواتير والمخزون إلى بيانات البداية. لا يؤثر على Supabase.</p>{message && <p className="mt-3 text-sm font-medium text-emerald-600">{message}</p>}</div><Button variant="secondary" onClick={handleReset}><span className="flex items-center gap-2"><RefreshCcw size={17} />إعادة البيانات</span></Button></div></section>
    </div>
  );
}
