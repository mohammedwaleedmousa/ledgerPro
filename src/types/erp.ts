export type Category = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  cost: number;
  price: number;
  stock: number;
  lowStockThreshold: number;
  description: string;
  isActive: boolean;
  createdAt: string;
};

export type CustomerStatus = "active" | "inactive";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  taxNumber: string;
  address: string;
  balance: number;
  status: CustomerStatus;
  notes: string;
  createdAt: string;
};

export type Supplier = {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  status: CustomerStatus;
  notes: string;
  createdAt: string;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type PaymentMethod = "cash" | "bank" | "card" | "credit";

export type InvoiceItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  total: number;
};

export type Invoice = {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  notes: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  createdAt: string;
};

export type StockMovementType = "opening" | "sale" | "adjustment" | "purchase";

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantityDelta: number;
  balanceAfter: number;
  reference: string;
  date: string;
};

export type ExpenseStatus = "paid" | "pending";

export type Expense = {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: ExpenseStatus;
  supplierId: string;
  createdAt: string;
};

export type ErpState = {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  stockMovements: StockMovement[];
  expenses: Expense[];
};

export type ProductInput = Omit<Product, "id" | "createdAt">;
export type CustomerInput = Omit<Customer, "id" | "createdAt">;
export type SupplierInput = Omit<Supplier, "id" | "createdAt">;
export type ExpenseInput = Omit<Expense, "id" | "createdAt">;
export type InvoiceInput = Pick<Invoice, "customerId" | "issueDate" | "paymentMethod" | "status" | "notes" | "taxRate"> & {
  items: Array<Pick<InvoiceItem, "productId" | "quantity" | "unitPrice">>;
};
