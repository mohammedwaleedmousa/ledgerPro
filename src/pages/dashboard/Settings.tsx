import ModulePage from "../../components/common/ModulePage";

export default function Settings() {
  return (
    <ModulePage
      title="الإعدادات"
      description="إدارة بيانات الشركة والمستخدمين والتفضيلات العامة"
      capabilities={["بيانات الشركة", "المستخدمون والصلاحيات", "العملة والضرائب", "ترقيم الفواتير والإشعارات"]}
    />
  );
}
