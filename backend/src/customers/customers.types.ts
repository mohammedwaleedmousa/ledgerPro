export type CustomerWriteInput = {
  name: string;
  email?: string;
  phone?: string;
  taxNumber?: string;
  address?: string;
  balance?: number;
  status: 'active' | 'inactive';
  notes?: string;
};

export type CustomerMutationResult = {
  customerId: string;
};
