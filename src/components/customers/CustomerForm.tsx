import Button from "../common/Button";
import Input from "../common/Input";
import Card from "../common/Card";

export default function CustomerForm() {
  return (
    <Card>
      <h2 className="text-lg font-bold text-gray-900">
        بيانات العميل
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input
          label="اسم العميل"
          placeholder="مثال: شركة التقنية"
        />

        <Input
          label="البريد الإلكتروني"
          placeholder="email@example.com"
        />

        <Input
          label="رقم الهاتف"
          placeholder="+967 xxx xxx xxx"
        />

        <Input
          label="الرقم الضريبي"
          placeholder="VAT Number"
        />

        <Input
          label="العنوان"
          placeholder="عنوان العميل"
        />

        <Input
          label="الرصيد الافتتاحي"
          placeholder="$0.00"
          type="number"
        />
      </div>

      <div className="mt-6">
        <Input
          label="ملاحظات"
          placeholder="ملاحظات إضافية..."
        />
      </div>

      <Button className="mt-6">
        حفظ العميل
      </Button>
    </Card>
  );
}