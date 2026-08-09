import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useErp } from "../../context/ErpContext";
import { appPaths } from "../../routes/navigation";
import Button from "../common/Button";
import Card from "../common/Card";
import Input from "../common/Input";

export default function CustomerForm() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const { customers, addCustomer, updateCustomer } = useErp();
  const existing = customers.find((customer) => customer.id === customerId);
  const [name, setName] = useState(existing?.name ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [taxNumber, setTaxNumber] = useState(existing?.taxNumber ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [balance, setBalance] = useState(String(existing?.balance ?? 0));
  const [status, setStatus] = useState<"active" | "inactive">(existing?.status ?? "active");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const input = { name, email: email.trim(), phone: phone.trim(), taxNumber: taxNumber.trim(), address: address.trim(), balance: Number(balance), status, notes: notes.trim() };
      if (existing) updateCustomer(existing.id, input);
      else addCustomer(input);
      navigate(appPaths.customers, { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ العميل.");
      setSaving(false);
    }
  }

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
          <Input label="الرصيد" type="number" step="0.01" min="0" value={balance} onChange={(event) => setBalance(event.target.value)} required />
          <div className="space-y-1.5">
            <label htmlFor="customer-status" className="block text-[11px] font-bold text-slate-600">الحالة</label>
            <select id="customer-status" value={status} onChange={(event) => setStatus(event.target.value as "active" | "inactive")} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"><option value="active">نشط</option><option value="inactive">غير نشط</option></select>
          </div>
          <Input label="ملاحظات" placeholder="ملاحظات إضافية..." value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="submit" loading={saving}>{existing ? "حفظ التعديلات" : "حفظ العميل"}</Button>
          <Button variant="secondary" onClick={() => navigate(appPaths.customers)}>إلغاء</Button>
        </div>
      </Card>
    </form>
  );
}
