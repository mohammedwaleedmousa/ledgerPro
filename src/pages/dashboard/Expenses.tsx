import ModulePage from "../../components/common/ModulePage";

export default function Expenses() {
  return (
    <ModulePage
      title="المصروفات"
      description="تسجيل ومتابعة المصروفات التشغيلية الخاصة بالشركة"
      capabilities={["تسجيل المصروف", "تصنيفات المصروفات", "إرفاق المستندات", "تقارير المصروفات حسب الفترة"]}
    />
  );
}
