export type SupplierWriteInput = {
  name: string;
  email?: string;
  phone?: string;
  balance?: number;
  status: 'active' | 'inactive';
  notes?: string;
};

export type SupplierMutationResult = {
  supplierId: string;
};
