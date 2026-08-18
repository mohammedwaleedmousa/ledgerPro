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

export type StockMovementType = "opening" | "sale" | "adjustment" | "purchase" | "return";

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

export type QuotationStatus = "draft" | "sent" | "accepted" | "expired" | "rejected";

export type Quotation = {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  expiryDate: string;
  status: QuotationStatus;
  notes: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  convertedInvoiceId?: string;
  convertedInvoiceNumber?: string;
  createdAt: string;
};

export type PurchaseOrderStatus = "draft" | "ordered" | "received" | "cancelled";

export type PurchaseOrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
};

export type PurchaseOrder = {
  id: string;
  number: string;
  supplierId: string;
  supplierName: string;
  issueDate: string;
  expectedDate: string;
  status: PurchaseOrderStatus;
  notes: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  createdAt: string;
};

export type PaymentDirection = "receipt" | "payment";
export type PaymentPartyType = "customer" | "supplier" | "other";

export type Payment = {
  id: string;
  number: string;
  direction: PaymentDirection;
  partyType: PaymentPartyType;
  partyId: string;
  partyName: string;
  date: string;
  method: PaymentMethod;
  amount: number;
  reference: string;
  notes: string;
  createdAt: string;
};

export type SalesReturn = {
  id: string;
  number: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  reason: string;
  amount: number;
  status: "completed";
  createdAt: string;
};

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export type Account = {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  balance: number;
  isActive: boolean;
  createdAt: string;
};

export type JournalLine = {
  id: string;
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
};

export type JournalEntry = {
  id: string;
  number: string;
  date: string;
  description: string;
  status: "posted" | "reversed";
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  isManual?: boolean;
  reversalOfId?: string;
  createdAt: string;
};

export type Warehouse = {
  id: string;
  name: string;
  location: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
};

export type TeamMemberRole = "owner" | "admin" | "accountant" | "sales" | "inventory" | "viewer";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  status: "active" | "invited";
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  actor: string;
  createdAt: string;
};

export type CompanySettings = {
  currency: "USD" | "YER" | "SAR";
  taxRate: number;
  invoicePrefix: string;
  quotationPrefix: string;
  purchasePrefix: string;
  fiscalYearStart: string;
};

export type ErpState = {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  stockMovements: StockMovement[];
  expenses: Expense[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  payments: Payment[];
  salesReturns: SalesReturn[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  warehouses: Warehouse[];
  teamMembers: TeamMember[];
  auditEvents: AuditEvent[];
  settings: CompanySettings;
};

export type ProductInput = Omit<Product, "id" | "createdAt">;
export type CustomerInput = Omit<Customer, "id" | "createdAt">;
export type SupplierInput = Omit<Supplier, "id" | "createdAt">;
export type ExpenseInput = Omit<Expense, "id" | "createdAt">;
export type InvoiceInput = Pick<Invoice, "customerId" | "issueDate" | "paymentMethod" | "status" | "notes" | "taxRate"> & {
  items: Array<Pick<InvoiceItem, "productId" | "quantity" | "unitPrice">>;
};

export type QuotationInput = Pick<Quotation, "customerId" | "issueDate" | "expiryDate" | "status" | "notes" | "taxRate"> & {
  items: Array<Pick<InvoiceItem, "productId" | "quantity" | "unitPrice">>;
};

export type PurchaseOrderInput = Pick<PurchaseOrder, "supplierId" | "issueDate" | "expectedDate" | "status" | "notes" | "taxRate"> & {
  items: Array<Pick<PurchaseOrderItem, "productId" | "quantity" | "unitCost">>;
};

export type PaymentInput = Pick<Payment, "direction" | "partyType" | "partyId" | "date" | "method" | "amount" | "reference" | "notes">;
export type AccountInput = Pick<Account, "code" | "name" | "type">;
export type JournalEntryInput = Pick<JournalEntry, "date" | "description"> & {
  lines: Array<Pick<JournalLine, "accountId" | "debit" | "credit">>;
};
export type WarehouseInput = Pick<Warehouse, "name" | "location">;
export type TeamMemberInput = Pick<TeamMember, "name" | "email" | "role">;
