export type ProductWriteInput = {
  name: string;
  sku: string;
  categoryId: string;
  cost: number;
  price: number;
  stock?: number;
  lowStockThreshold: number;
  description?: string;
  isActive?: boolean;
};

export type ProductMutationResult = {
  productId: string;
};
