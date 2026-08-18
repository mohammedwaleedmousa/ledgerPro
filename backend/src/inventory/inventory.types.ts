export type StockAdjustmentInput = {
  productId: string;
  quantityDelta: number;
  reference?: string;
};

export type StockAdjustmentResult = {
  productId: string;
  stock: number;
  value: number;
};
