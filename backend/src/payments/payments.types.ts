export type PaymentWriteInput = {
  direction: 'receipt' | 'payment';
  partyId: string;
  date: string;
  method: 'cash' | 'bank' | 'card';
  amount: number;
  reference?: string;
  notes?: string;
};

export type PaymentMutationResult = {
  paymentId: string;
  paymentNumber: string;
  amount: number;
};
