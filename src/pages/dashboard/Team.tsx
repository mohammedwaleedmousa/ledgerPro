import { MailPlus, ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import { useState } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Table from "../../components/common/Table";
import { useErp } from "../../context/ErpContext";
import { formatDate, formatNumber } from "../../lib/format";
import type { TeamMemberRole } from "../../types/erp";

const roleLabels: Record<TeamMemberRole, string> = { owner: "المالك", admin: "مدير", accountant: "محاسب", sales: "مبيعات", inventory: "مخزون", viewer: "مشاهدة فقط" };

export default function Team() {
  const { teamMembers, addTeamMember } = useErp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMemberRole>("accountant");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      addTeamMember({ name, email, role });
      setName(""); setEmail(""); setError(null); setMessage("تم إنشاء دعوة العضو داخل النسخة التجريبية.");
    } catch (memberError) {
      setMessage(null);
      setError(memberError instanceof Error ? memberError.message : "تعذر إضافة العضو.");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="الفريق والصلاحيات" description="أضف أعضاء الشركة وحدد نطاق وصولهم إلى وحدات النظام." eyebrow="إدارة SaaS" />
      {message && <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[11px] font-bold text-emerald-700">{message}</div>}
      <div className="grid gap-3 md:grid-cols-3"><StatCard title="إجمالي الأعضاء" value={formatNumber(teamMembers.length)} icon={UsersRound} /><StatCard title="أعضاء نشطون" value={formatNumber(teamMembers.filter((item) => item.status === "active").length)} icon={ShieldCheck} tone="emerald" /><StatCard title="دعوات معلقة" value={formatNumber(teamMembers.filter((item) => item.status === "invited").length)} icon={MailPlus} tone="amber" /></div>

      <form onSubmit={handleSubmit}><Card><div><h2 className="text-sm font-extrabold text-slate-900">دعوة عضو</h2><p className="mt-1 text-[10px] text-slate-400">الدعوة الفعلية بالبريد ستُرسل من NestJS باستخدام صلاحية خادم، وليس من المتصفح.</p></div>{error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}<div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_220px_auto] xl:items-end"><Input label="الاسم" value={name} onChange={(event) => setName(event.target.value)} required /><Input label="البريد الإلكتروني" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /><div className="space-y-1.5"><label htmlFor="team-role" className="block text-[11px] font-bold text-slate-600">الدور</label><select id="team-role" value={role} onChange={(event) => setRole(event.target.value as TeamMemberRole)} className="min-h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-xs outline-none">{Object.entries(roleLabels).filter(([value]) => value !== "owner").map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><Button type="submit"><UserPlus size={15} />إرسال الدعوة</Button></div></Card></form>

      <Table minWidth="760px"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">العضو</th><th className="p-4">البريد</th><th className="p-4">الدور</th><th className="p-4">الحالة</th><th className="p-4">تاريخ الإضافة</th></tr></thead><tbody>{teamMembers.map((member) => <tr key={member.id} className="border-b border-slate-100 last:border-0"><td className="p-4 text-xs font-bold text-slate-800">{member.name}</td><td className="p-4 text-[10px] text-slate-500">{member.email}</td><td className="p-4"><Badge variant="info">{roleLabels[member.role]}</Badge></td><td className="p-4"><Badge variant={member.status === "active" ? "success" : "warning"}>{member.status === "active" ? "نشط" : "بانتظار القبول"}</Badge></td><td className="p-4 text-[10px] text-slate-500">{formatDate(member.createdAt)}</td></tr>)}</tbody></Table>
    </div>
  );
}
