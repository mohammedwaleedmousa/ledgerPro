import CustomerForm from "../../components/customers/CustomerForm";
import { useParams } from "react-router-dom";
import { useErp } from "../../context/ErpContext";
import PageHeader from "../../components/common/PageHeader";

export default function CreateCustomer() {
  const { customerId } = useParams();
  const { customers } = useErp();
  const existing = customers.find((customer) => customer.id === customerId);

  return (
    <div className="space-y-4">
      <PageHeader title={existing ? "تعديل العميل" : "إضافة عميل"} description={existing ? "تحديث ملف العميل وبيانات التواصل." : "إنشاء ملف عميل جديد مع بيانات الرصيد والضريبة."} eyebrow="جهات التعامل" />
      <CustomerForm />
    </div>
  );
}
