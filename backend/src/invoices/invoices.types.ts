export type PostInvoiceItemInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type PostInvoiceInput = {
  customerId: string;
  issueDate: string;
  paymentMethod: 'cash' | 'bank' | 'card' | 'credit';
  taxRate: number;
  notes?: string;
  items: PostInvoiceItemInput[];
};

export type PostedInvoiceResult = {
  invoiceId: string;
  invoiceNumber: string;
  total: number;
};
