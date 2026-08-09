import ProductForm from "../../components/products/ProductForm";
import { useParams } from "react-router-dom";
import { useErp } from "../../context/ErpContext";

export default function CreateProduct() {
  const { productId } = useParams();
  const { products } = useErp();
  const existing = products.find((product) => product.id === productId);

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {existing ? "تعديل المنتج" : "إضافة منتج"}
        </h1>

        <p className="mt-2 text-gray-500">
          {existing ? "تحديث بيانات المنتج والأسعار والمخزون" : "إضافة منتج جديد إلى المخزون"}
        </p>
      </div>

      <ProductForm />

    </div>
  );
}
