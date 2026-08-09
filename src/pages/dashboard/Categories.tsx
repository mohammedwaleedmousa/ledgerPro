import ModulePage from "../../components/common/ModulePage";

export default function Categories() {
  return (
    <ModulePage
      title="التصنيفات"
      description="تنظيم المنتجات داخل تصنيفات واضحة خاصة بشركتك"
      capabilities={["إضافة وتعديل التصنيفات", "البحث والفلترة", "عدد المنتجات داخل كل تصنيف", "حالة التصنيف وترتيبه"]}
    />
  );
}
