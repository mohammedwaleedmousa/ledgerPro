import ProductForm from "../../components/products/ProductForm";

export default function CreateProduct() {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          إضافة منتج
        </h1>

        <p className="mt-2 text-gray-500">
          إضافة منتج جديد إلى المخزون
        </p>
      </div>

      <ProductForm />

    </div>
  );
}