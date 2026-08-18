import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "حدث خطأ أثناء إنشاء الحساب.";
  if (error.message.toLowerCase().includes("already registered")) return "هذا البريد مسجل مسبقًا.";
  if (error.message.toLowerCase().includes("password")) return "كلمة المرور لا تحقق متطلبات الأمان.";
  return error.message;
}

export default function Register() {
  const navigate = useNavigate();
  const { register, isSupabaseConfigured } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return;
    }

    setLoading(true);

    try {
      const result = await register({ companyName, name, email, password });
      if (result.needsEmailConfirmation) {
        setConfirmationSent(true);
      } else {
        navigate("/app", { replace: true });
      }
    } catch (registerError) {
      setError(getErrorMessage(registerError));
    } finally {
      setLoading(false);
    }
  }

  if (confirmationSent) {
    return (
      <AuthCard title="تحقق من بريدك" description="أرسلنا رابط تأكيد الحساب إلى بريدك الإلكتروني">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-800">بعد تأكيد البريد ارجع إلى LedgerPro وسجّل الدخول. تم إنشاء شركتك ودور المالك تلقائيًا.</div>
        <Link to="/login" className="mt-6 block rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-blue-700">العودة لتسجيل الدخول</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="إنشاء حساب" description="أنشئ شركتك وابدأ استخدام LedgerPro">
      {!isSupabaseConfigured && <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">سيُنشأ حساب تجريبي محلي لأن Supabase غير مربوط بعد.</div>}
      {error && <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <form className="space-y-5" onSubmit={handleRegister}>
        <Input label="اسم الشركة" autoComplete="organization" placeholder="شركة التقنية" value={companyName} onChange={(event) => setCompanyName(event.target.value)} minLength={2} required />
        <Input label="الاسم الكامل" autoComplete="name" placeholder="محمد وليد" value={name} onChange={(event) => setName(event.target.value)} minLength={2} required />
        <Input label="البريد الإلكتروني" type="email" autoComplete="email" placeholder="email@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Input label="كلمة المرور" type="password" autoComplete="new-password" placeholder="8 أحرف على الأقل" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
        <Button type="submit" className="w-full" loading={loading}>إنشاء الشركة والحساب</Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">لديك حساب؟ <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">سجّل الدخول</Link></p>
    </AuthCard>
  );
}
