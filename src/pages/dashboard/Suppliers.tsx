import ModulePage from "../../components/common/ModulePage";

export default function Suppliers() {
  return (
    <ModulePage
      title="الموردون"
      description="إدارة بيانات الموردين والمشتريات والأرصدة المستحقة"
      capabilities={["ملفات الموردين", "الأرصدة والمدفوعات", "سجل المشتريات", "البحث والتصفية"]}
    />
  );
}
