import ProductForm from "../../components/products/ProductForm";
import { useParams } from "react-router-dom";
import { useErp } from "../../context/ErpContext";
import PageHeader from "../../components/common/PageHeader";

export default function CreateProduct() {
  const { productId } = useParams();
  const { products } = useErp();
  const existing = products.find((product) => product.id === productId);

  return (
    <div className="space-y-4">
      <PageHeader title={existing ? "تعديل المنتج" : "إضافة منتج"} description={existing ? "تحديث بيانات المنتج والأسعار والمخزون." : "إضافة منتج جديد إلى كتالوج الشركة والمخزون."} eyebrow="المنتجات" />

      <ProductForm />
    </div>
  );
}
