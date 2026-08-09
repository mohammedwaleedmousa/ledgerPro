import Button from "../common/Button";
import Input from "../common/Input";
import Card from "../common/Card";
import ProductImageUpload from "./ProductImageUpload";

export default function ProductForm() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

      <div className="xl:col-span-2">
        <Card>
          <h2 className="text-lg font-bold text-gray-900">
            معلومات المنتج
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

            <Input
              label="اسم المنتج"
              placeholder="مثال: Laptop Pro"
            />

            <Input
              label="SKU"
              placeholder="LP-001"
            />

            <Input
              label="سعر البيع"
              placeholder="$0.00"
            />

            <Input
              label="سعر التكلفة"
              placeholder="$0.00"
            />

            <Input
              label="الكمية"
              placeholder="0"
              type="number"
            />

            <Input
              label="التصنيف"
              placeholder="اختر التصنيف"
            />

          </div>


          <div className="mt-6">
            <Input
              label="وصف المنتج"
              placeholder="وصف مختصر..."
            />
          </div>


          <Button className="mt-6">
            حفظ المنتج
          </Button>

        </Card>
      </div>


      <ProductImageUpload />

    </div>
  );
}