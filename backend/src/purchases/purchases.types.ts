export type PurchaseOrderWriteInput = {
  supplierId: string;
  issueDate: string;
  expectedDate: string;
  status: 'draft' | 'ordered';
  taxRate: number;
  notes?: string;
  items: Array<{ productId: string; quantity: number; unitCost: number }>;
};
