import CustomerForm from "../../components/customers/CustomerForm";

export default function CreateCustomer() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          إضافة عميل
        </h1>

        <p className="mt-2 text-gray-500">
          إنشاء ملف عميل جديد
        </p>
      </div>

      <CustomerForm />
    </div>
  );
}