import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { appPaths } from "../../routes/navigation";
import Button from "../common/Button";
import Card from "../common/Card";
import PageHeader from "../common/PageHeader";

type Props = { search: string; onSearchChange: (value: string) => void };

export default function InvoiceHeader({ search, onSearchChange }: Props) {
  const navigate = useNavigate();
  return <><PageHeader title="الفواتير" description="متابعة دورة الفاتورة من المسودة حتى التحصيل." eyebrow="المبيعات" actions={<Button onClick={() => navigate(appPaths.createInvoice)}><Plus size={15} />إنشاء فاتورة</Button>} /><Card className="mt-4 p-3 sm:p-4"><label className="flex min-h-10 max-w-xl items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3"><Search size={15} className="text-slate-400" /><span className="sr-only">بحث عن فاتورة</span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="رقم الفاتورة أو العميل..." className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label></Card></>;
}
