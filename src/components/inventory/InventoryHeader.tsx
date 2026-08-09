import { Search } from "lucide-react";
import Card from "../common/Card";
import PageHeader from "../common/PageHeader";

type Props = { search: string; onSearchChange: (value: string) => void };

export default function InventoryHeader({ search, onSearchChange }: Props) {
  return <><PageHeader title="المخزون" description="متابعة الأرصدة وحركات البيع والشراء والتسويات." eyebrow="المنتجات" /><Card className="mt-4 p-3 sm:p-4"><label className="flex min-h-10 max-w-xl items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3"><Search size={15} className="text-slate-400" /><span className="sr-only">البحث في المخزون</span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="المنتج أو المرجع..." className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label></Card></>;
}
