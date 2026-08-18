import { Activity, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Table from "../../components/common/Table";
import { useErp } from "../../context/ErpContext";
import { formatDate, formatNumber } from "../../lib/format";

const entityLabels: Record<string, string> = { invoice: "فاتورة", expense: "مصروف", quotation: "عرض سعر", purchase_order: "أمر شراء", payment: "سند", sales_return: "مرتجع", account: "حساب", journal_entry: "قيد", warehouse: "مستودع", team_member: "عضو", settings: "إعدادات", product: "منتج", customer: "عميل", supplier: "مورد", category: "تصنيف", stock_movement: "حركة مخزون" };

export default function ActivityLog() {
  const { auditEvents } = useErp();
  const [search, setSearch] = useState("");
  const normalized = search.trim().toLowerCase();
  const events = auditEvents.filter((event) => !normalized || event.action.toLowerCase().includes(normalized) || event.actor.toLowerCase().includes(normalized) || (entityLabels[event.entity] ?? event.entity).toLowerCase().includes(normalized));

  return (
    <div className="space-y-4">
      <PageHeader title="سجل النشاط" description="مسار تدقيق لأهم العمليات التي ينفذها أعضاء الشركة." eyebrow="الأمان" />
      <div className="grid gap-3 md:grid-cols-2"><StatCard title="الأحداث المسجلة" value={formatNumber(auditEvents.length)} icon={Activity} /><StatCard title="حماية ومراجعة" value="مفعّل" icon={ShieldCheck} tone="emerald" meta="سجل مستقل لكل شركة" /></div>
      <Card className="p-3 sm:p-4"><label className="flex h-10 max-w-md items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3"><Search size={15} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="العملية أو المستخدم أو الوحدة..." className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label></Card>
      <Table minWidth="720px"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] text-slate-400"><th className="p-4">العملية</th><th className="p-4">الوحدة</th><th className="p-4">المستخدم</th><th className="p-4">المعرّف</th><th className="p-4">التاريخ</th></tr></thead><tbody>{events.map((event) => <tr key={event.id} className="border-b border-slate-100 last:border-0"><td className="p-4 text-xs font-bold text-slate-800">{event.action}</td><td className="p-4"><Badge variant="info">{entityLabels[event.entity] ?? event.entity}</Badge></td><td className="p-4 text-[10px] text-slate-600">{event.actor}</td><td className="max-w-48 truncate p-4 font-mono text-[9px] text-slate-400">{event.entityId}</td><td className="p-4 text-[10px] text-slate-500">{formatDate(event.createdAt)}</td></tr>)}{events.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-xs text-slate-400">لا توجد أحداث مطابقة.</td></tr>}</tbody></Table>
    </div>
  );
}
