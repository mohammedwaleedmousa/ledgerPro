import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";

type LocationState = {
  from?: string;
};

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "تعذر تسجيل الدخول. حاول مجددًا.";
  if (error.message.toLowerCase().includes("invalid login credentials")) return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (error.message.toLowerCase().includes("email not confirmed")) return "يجب تأكيد البريد الإلكتروني أولًا.";
  return error.message;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginDemo, error: authError, clearError, isSupabaseConfigured, isDemoAvailable } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const destination = (location.state as LocationState | null)?.from ?? "/app";

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setFormError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    clearError();
    setFormError(null);
    setDemoLoading(true);

    try {
      await loginDemo();
      navigate("/app", { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <AuthCard title="تسجيل الدخول" description="ادخل إلى لوحة إدارة شركتك">
      {!isSupabaseConfigured && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          Supabase غير مربوط بعد. يمكنك تجربة النظام كاملًا من زر الدخول التجريبي.
        </div>
      )}

      {(formError || authError) && <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{formError || authError}</div>}

      <form className="space-y-5" onSubmit={handleLogin}>
        <Input label="البريد الإلكتروني" type="email" autoComplete="email" placeholder="email@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Input label="كلمة المرور" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
        <Button type="submit" className="w-full" loading={loading} disabled={!isSupabaseConfigured}>دخول</Button>
      </form>

      {isDemoAvailable && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-gray-400"><span className="h-px flex-1 bg-gray-200" /><span>أو</span><span className="h-px flex-1 bg-gray-200" /></div>
          <Button variant="secondary" className="w-full" loading={demoLoading} onClick={() => void handleDemoLogin()}>دخول تجريبي فوري</Button>
        </>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">ليس لديك حساب؟ <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">أنشئ شركتك</Link></p>
    </AuthCard>
  );
}
