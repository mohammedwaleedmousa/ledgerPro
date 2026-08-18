import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useErp } from "../../context/ErpContext";
import { apiRequest } from "../../lib/api";
import { appPaths } from "../../routes/navigation";
import type { Customer } from "../../types/erp";
import Button from "../common/Button";
import Card from "../common/Card";
import Input from "../common/Input";

export default function CustomerForm() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const { user } = useAuth();
  const erp = useErp();
  const isProduction = user?.mode === "supabase";
  const localExisting = erp.customers.find((customer) => customer.id === customerId);
  const [existing, setExisting] = useState<Customer | undefined>(isProduction ? undefined : localExisting);
  const [name, setName] = useState(localExisting?.name ?? "");
  const [email, setEmail] = useState(localExisting?.email ?? "");
  const [phone, setPhone] = useState(localExisting?.phone ?? "");
  const [taxNumber, setTaxNumber] = useState(localExisting?.taxNumber ?? "");
  const [address, setAddress] = useState(localExisting?.address ?? "");
  const [balance, setBalance] = useState(String(localExisting?.balance ?? 0));
  const [status, setStatus] = useState<"active" | "inactive">(localExisting?.status ?? "active");
  const [notes, setNotes] = useState(localExisting?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(isProduction && customerId));

  useEffect(() => {
    if (!isProduction || !customerId) return;
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const customer = await apiRequest<Customer | null>(`/erp/customers/${customerId}`);
        if (!active) return;
        if (!customer) {
          setError("العميل غير موجود أو لا ينتمي إلى شركتك.");
          return;
        }
        setExisting(customer);
        setName(customer.name);
        setEmail(customer.email);
        setPhone(customer.phone);
        setTaxNumber(customer.taxNumber);
        setAddress(customer.address);
        setBalance(String(customer.balance));
        setStatus(customer.status);
        setNotes(customer.notes);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "تعذر تحميل بيانات العميل.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [customerId, isProduction]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const input = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        taxNumber: taxNumber.trim(),
        address: address.trim(),
        balance: Number(balance || 0),
        status,
        notes: notes.trim(),
      };

      if (isProduction) {
        if (existing) await apiRequest(`/customers/${existing.id}`, { method: "PATCH", body: JSON.stringify(input) });
        else await apiRequest("/customers", { method: "POST", body: JSON.stringify(input) });
      } else if (existing) {
        erp.updateCustomer(existing.id, input);
      } else {
        erp.addCustomer(input);
      }

      navigate(appPaths.customers, { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ العميل.");
      setSaving(false);
    }
  }

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-500">جارٍ تحميل بيانات العميل...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 className="text-sm font-black text-slate-900">بيانات العميل</h2>
        <p className="mt-1 text-[10px] text-slate-400">بيانات التواصل والضرائب والرصيد الافتتاحي.</p>
        {error && <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="اسم العميل" placeholder="مثال: شركة التقنية" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input label="البريد الإلكتروني" type="email" placeholder="email@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input label="رقم الهاتف" placeholder="+967 xxx xxx xxx" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <Input label="الرقم الضريبي" placeholder="VAT Number" value={taxNumber} onChange={(event) => setTaxNumber(event.target.value)} />
          <Input label="العنوان" placeholder="عنوان العميل" value={address} onChange={(event) => setAddress(event.target.value)} />
          <Input label={existing && isProduction ? "الرصيد الحالي (يتغير عبر العمليات المالية)" : "الرصيد الافتتاحي"} type="number" step="0.01" min="0" value={balance} onChange={(event) => setBalance(event.target.value)} disabled={Boolean(existing && isProduction)} required />
          <div className="space-y-1.5">
            <label htmlFor="customer-status" className="block text-[11px] font-bold text-slate-600">الحالة</label>
            <select id="customer-status" value={status} onChange={(event) => setStatus(event.target.value as "active" | "inactive")} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"><option value="active">نشط</option><option value="inactive">غير نشط</option></select>
          </div>
          <Input label="ملاحظات" placeholder="ملاحظات إضافية..." value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>

        {existing && isProduction && <p className="mt-3 text-[10px] leading-5 text-amber-700">الرصيد الحالي لا يُعدل يدويًا من ملف العميل؛ يتغير عبر الفواتير والتحصيلات والتسويات المحاسبية.</p>}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="submit" loading={saving}>{existing ? "حفظ التعديلات" : "حفظ العميل"}</Button>
          <Button variant="secondary" onClick={() => navigate(appPaths.customers)}>إلغاء</Button>
        </div>
      </Card>
    </form>
  );
}
