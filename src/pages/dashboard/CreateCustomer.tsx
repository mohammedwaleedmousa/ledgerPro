import CustomerForm from "../../components/customers/CustomerForm";
import { useParams } from "react-router-dom";
import { useErp } from "../../context/ErpContext";

export default function CreateCustomer() {
  const { customerId } = useParams();
  const { customers } = useErp();
  const existing = customers.find((customer) => customer.id === customerId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {existing ? "تعديل العميل" : "إضافة عميل"}
        </h1>

        <p className="mt-2 text-gray-500">
          {existing ? "تحديث ملف العميل وبيانات التواصل" : "إنشاء ملف عميل جديد"}
        </p>
      </div>

      <CustomerForm />
    </div>
  );
}
