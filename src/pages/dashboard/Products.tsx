import { useState } from "react";
import ProductHeader from "../../components/products/ProductHeader";
import ProductStats from "../../components/products/ProductStats";
import ProductTable from "../../components/products/ProductTable";
import { useErp } from "../../context/ErpContext";

export default function Products() {
  const { categories } = useErp();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  return (
    <div className="space-y-6">
      <ProductHeader search={search} categoryId={categoryId} categories={categories} onSearchChange={setSearch} onCategoryChange={setCategoryId} />

      <ProductStats />

      <ProductTable search={search} categoryId={categoryId} />
    </div>
  );
}
