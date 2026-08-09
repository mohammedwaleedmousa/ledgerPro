import ProductHeader from "../../components/products/ProductHeader";
import ProductStats from "../../components/products/ProductStats";
import ProductTable from "../../components/products/ProductTable";

export default function Products() {
  return (
    <div className="space-y-6">
      <ProductHeader />

      <ProductStats />

      <ProductTable />
    </div>
  );
}