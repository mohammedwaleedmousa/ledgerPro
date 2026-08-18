import { createContext, useContext, useEffect, useState } from "react";
import { readLocalValue, writeLocalValue } from "../lib/demo";
import { setActiveCurrency } from "../lib/format";
import type {
  Account,
  AccountInput,
  AuditEvent,
  Category,
  CompanySettings,
  Customer,
  CustomerInput,
  ErpState,
  Expense,
  ExpenseInput,
  Invoice,
  InvoiceInput,
  InvoiceStatus,
  JournalEntry,
  JournalEntryInput,
  Payment,
  PaymentInput,
  Product,
  ProductInput,
  PurchaseOrder,
  PurchaseOrderInput,
  Quotation,
  QuotationInput,
  QuotationStatus,
  SalesReturn,
  StockMovement,
  Supplier,
  SupplierInput,
  TeamMember,
  TeamMemberInput,
  Warehouse,
  WarehouseInput,
} from "../types/erp";
import { useCompany } from "./CompanyContext";
import { useAuth } from "./AuthContext";

type ErpContextType = ErpState & {
  addCategory: (name: string, description: string) => Category;
  removeCategory: (id: string) => void;
  addProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, input: ProductInput) => Product;
  removeProduct: (id: string) => void;
  addCustomer: (input: CustomerInput) => Customer;
  updateCustomer: (id: string, input: CustomerInput) => Customer;
  removeCustomer: (id: string) => void;
  addSupplier: (input: SupplierInput) => Supplier;
  removeSupplier: (id: string) => void;
  addExpense: (input: ExpenseInput) => Expense;
  removeExpense: (id: string) => void;
  createInvoice: (input: InvoiceInput) => Invoice;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  createQuotation: (input: QuotationInput) => Quotation;
  updateQuotationStatus: (id: string, status: QuotationStatus) => void;
  convertQuotationToInvoice: (id: string) => Invoice;
  createPurchaseOrder: (input: PurchaseOrderInput) => PurchaseOrder;
  updatePurchaseOrderStatus: (id: string, status: PurchaseOrder["status"]) => void;
  receivePurchaseOrder: (id: string) => void;
  createPayment: (input: PaymentInput) => Payment;
  createSalesReturn: (invoiceId: string, reason: string) => SalesReturn;
  addAccount: (input: AccountInput) => Account;
  createJournalEntry: (input: JournalEntryInput) => JournalEntry;
  addWarehouse: (input: WarehouseInput) => Warehouse;
  addTeamMember: (input: TeamMemberInput) => TeamMember;
  updateSettings: (settings: CompanySettings) => void;
  adjustStock: (productId: string, quantityDelta: number, reference: string) => void;
  resetDemoData: () => ErpState;
};

const ErpContext = createContext<ErpContextType | null>(null);

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `erp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function dateOnly(daysOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().slice(0, 10);
}

function timestamp(daysOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
}

function seedState(): ErpState {
  const categories: Category[] = [
    { id: "category-devices", name: "أجهزة", description: "أجهزة الحاسوب والمعدات", isActive: true, createdAt: timestamp(-90) },
    { id: "category-phones", name: "هواتف", description: "الهواتف الذكية", isActive: true, createdAt: timestamp(-80) },
    { id: "category-accessories", name: "إكسسوارات", description: "ملحقات وإكسسوارات", isActive: true, createdAt: timestamp(-70) },
  ];
  const products: Product[] = [
    { id: "product-laptop", name: "Laptop Pro", sku: "LP-001", categoryId: "category-devices", cost: 850, price: 1200, stock: 45, lowStockThreshold: 8, description: "حاسوب محمول للأعمال", isActive: true, createdAt: timestamp(-60) },
    { id: "product-phone", name: "Smart Phone", sku: "SP-002", categoryId: "category-phones", cost: 560, price: 800, stock: 20, lowStockThreshold: 6, description: "هاتف ذكي", isActive: true, createdAt: timestamp(-50) },
    { id: "product-headphones", name: "Headphones", sku: "HP-003", categoryId: "category-accessories", cost: 75, price: 150, stock: 5, lowStockThreshold: 7, description: "سماعة لاسلكية", isActive: true, createdAt: timestamp(-40) },
  ];
  const customers: Customer[] = [
    { id: "customer-tech", name: "شركة التقنية", email: "finance@tech.example", phone: "777123456", taxNumber: "100200300", address: "عدن", balance: 2300, status: "active", notes: "عميل شركات", createdAt: timestamp(-55) },
    { id: "customer-future", name: "متجر المستقبل", email: "hello@future.example", phone: "777654321", taxNumber: "", address: "صنعاء", balance: 0, status: "active", notes: "", createdAt: timestamp(-35) },
    { id: "customer-build", name: "شركة البناء", email: "accounts@build.example", phone: "777987654", taxNumber: "200300400", address: "حضرموت", balance: 0, status: "inactive", notes: "", createdAt: timestamp(-20) },
  ];
  const suppliers: Supplier[] = [
    { id: "supplier-global", name: "المورد العالمي", email: "sales@supplier.example", phone: "733111222", balance: 8400, status: "active", notes: "أجهزة وإلكترونيات", createdAt: timestamp(-75) },
    { id: "supplier-local", name: "شركة التوريد المحلية", email: "", phone: "777222333", balance: 1200, status: "active", notes: "مواد تشغيلية", createdAt: timestamp(-30) },
  ];
  const invoices: Invoice[] = [
    {
      id: "invoice-1",
      number: "INV-0001",
      customerId: "customer-future",
      customerName: "متجر المستقبل",
      issueDate: dateOnly(-5),
      paymentMethod: "bank",
      status: "paid",
      notes: "",
      items: [{ id: "item-1", productId: "product-laptop", productName: "Laptop Pro", quantity: 2, unitPrice: 1200, unitCost: 850, total: 2400 }],
      subtotal: 2400,
      taxRate: 5,
      taxAmount: 120,
      total: 2520,
      createdAt: timestamp(-5),
    },
    {
      id: "invoice-2",
      number: "INV-0002",
      customerId: "customer-tech",
      customerName: "شركة التقنية",
      issueDate: dateOnly(-2),
      paymentMethod: "credit",
      status: "sent",
      notes: "استحقاق خلال 30 يومًا",
      items: [{ id: "item-2", productId: "product-phone", productName: "Smart Phone", quantity: 2, unitPrice: 800, unitCost: 560, total: 1600 }],
      subtotal: 1600,
      taxRate: 5,
      taxAmount: 80,
      total: 1680,
      createdAt: timestamp(-2),
    },
  ];
  const stockMovements: StockMovement[] = [
    { id: "movement-sale-phone", productId: "product-phone", productName: "Smart Phone", type: "sale", quantityDelta: -2, balanceAfter: 20, reference: "INV-0002", date: timestamp(-2) },
    { id: "movement-sale-laptop", productId: "product-laptop", productName: "Laptop Pro", type: "sale", quantityDelta: -2, balanceAfter: 45, reference: "INV-0001", date: timestamp(-5) },
    { id: "opening-product-headphones", productId: "product-headphones", productName: "Headphones", type: "opening", quantityDelta: 5, balanceAfter: 5, reference: "رصيد افتتاحي", date: timestamp(-60) },
    { id: "opening-product-phone", productId: "product-phone", productName: "Smart Phone", type: "opening", quantityDelta: 22, balanceAfter: 22, reference: "رصيد افتتاحي", date: timestamp(-60) },
    { id: "opening-product-laptop", productId: "product-laptop", productName: "Laptop Pro", type: "opening", quantityDelta: 47, balanceAfter: 47, reference: "رصيد افتتاحي", date: timestamp(-60) },
  ];
  const expenses: Expense[] = [
    { id: "expense-1", category: "إيجار", description: "إيجار المكتب", amount: 900, date: dateOnly(-4), status: "paid", supplierId: "supplier-local", createdAt: timestamp(-4) },
    { id: "expense-2", category: "خدمات", description: "إنترنت واتصالات", amount: 180, date: dateOnly(-1), status: "paid", supplierId: "", createdAt: timestamp(-1) },
  ];
  const quotations: Quotation[] = [{
    id: "quotation-1", number: "QT-0001", customerId: "customer-tech", customerName: "شركة التقنية",
    issueDate: dateOnly(-3), expiryDate: dateOnly(12), status: "sent", notes: "العرض صالح لمدة 15 يومًا",
    items: [{ id: "quotation-item-1", productId: "product-laptop", productName: "Laptop Pro", quantity: 3, unitPrice: 1200, unitCost: 850, total: 3600 }],
    subtotal: 3600, taxRate: 5, taxAmount: 180, total: 3780, createdAt: timestamp(-3),
  }];
  const purchaseOrders: PurchaseOrder[] = [{
    id: "purchase-1", number: "PO-0001", supplierId: "supplier-global", supplierName: "المورد العالمي",
    issueDate: dateOnly(-6), expectedDate: dateOnly(4), status: "ordered", notes: "توريد عاجل للمخزون",
    items: [{ id: "purchase-item-1", productId: "product-headphones", productName: "Headphones", quantity: 20, unitCost: 75, total: 1500 }],
    subtotal: 1500, taxRate: 0, taxAmount: 0, total: 1500, createdAt: timestamp(-6),
  }];
  const payments: Payment[] = [
    { id: "payment-1", number: "REC-0001", direction: "receipt", partyType: "customer", partyId: "customer-future", partyName: "متجر المستقبل", date: dateOnly(-5), method: "bank", amount: 2520, reference: "INV-0001", notes: "تحصيل كامل", createdAt: timestamp(-5) },
    { id: "payment-2", number: "PAY-0001", direction: "payment", partyType: "supplier", partyId: "supplier-local", partyName: "شركة التوريد المحلية", date: dateOnly(-4), method: "bank", amount: 900, reference: "إيجار المكتب", notes: "", createdAt: timestamp(-4) },
  ];
  const salesReturns: SalesReturn[] = [];
  const accounts: Account[] = [
    { id: "account-cash", code: "1101", name: "الصندوق", type: "asset", balance: 7800, isActive: true, createdAt: timestamp(-120) },
    { id: "account-bank", code: "1102", name: "البنك", type: "asset", balance: 25620, isActive: true, createdAt: timestamp(-120) },
    { id: "account-receivables", code: "1201", name: "العملاء", type: "asset", balance: 2300, isActive: true, createdAt: timestamp(-120) },
    { id: "account-inventory", code: "1301", name: "المخزون", type: "asset", balance: 49750, isActive: true, createdAt: timestamp(-120) },
    { id: "account-payables", code: "2101", name: "الموردون", type: "liability", balance: 9600, isActive: true, createdAt: timestamp(-120) },
    { id: "account-capital", code: "3101", name: "رأس المال", type: "equity", balance: 50000, isActive: true, createdAt: timestamp(-120) },
    { id: "account-sales", code: "4101", name: "إيرادات المبيعات", type: "revenue", balance: 2520, isActive: true, createdAt: timestamp(-120) },
    { id: "account-cogs", code: "5101", name: "تكلفة البضاعة المباعة", type: "expense", balance: 1700, isActive: true, createdAt: timestamp(-120) },
    { id: "account-operations", code: "5201", name: "مصروفات تشغيلية", type: "expense", balance: 1080, isActive: true, createdAt: timestamp(-120) },
  ];
  const journalEntries: JournalEntry[] = [
    {
      id: "journal-1", number: "JE-0001", date: dateOnly(-5), description: "إثبات تحصيل الفاتورة INV-0001", status: "posted", totalDebit: 2520, totalCredit: 2520, createdAt: timestamp(-5),
      lines: [
        { id: "journal-line-1", accountId: "account-bank", accountName: "البنك", debit: 2520, credit: 0 },
        { id: "journal-line-2", accountId: "account-sales", accountName: "إيرادات المبيعات", debit: 0, credit: 2520 },
      ],
    },
    {
      id: "journal-2", number: "JE-0002", date: dateOnly(-4), description: "إثبات إيجار المكتب", status: "posted", totalDebit: 900, totalCredit: 900, createdAt: timestamp(-4),
      lines: [
        { id: "journal-line-3", accountId: "account-operations", accountName: "مصروفات تشغيلية", debit: 900, credit: 0 },
        { id: "journal-line-4", accountId: "account-bank", accountName: "البنك", debit: 0, credit: 900 },
      ],
    },
  ];
  const warehouses: Warehouse[] = [
    { id: "warehouse-main", name: "المستودع الرئيسي", location: "عدن", isDefault: true, isActive: true, createdAt: timestamp(-120) },
  ];
  const teamMembers: TeamMember[] = [
    { id: "team-owner", name: "محمد وليد", email: "demo@ledgerpro.app", role: "owner", status: "active", createdAt: timestamp(-120) },
    { id: "team-accountant", name: "أحمد علي", email: "accountant@ledgerpro.app", role: "accountant", status: "invited", createdAt: timestamp(-1) },
  ];
  const auditEvents: AuditEvent[] = [
    { id: "audit-1", action: "أنشأ فاتورة", entity: "invoice", entityId: "invoice-2", actor: "محمد وليد", createdAt: timestamp(-2) },
    { id: "audit-2", action: "سجل مصروفًا", entity: "expense", entityId: "expense-2", actor: "محمد وليد", createdAt: timestamp(-1) },
  ];
  const settings: CompanySettings = { currency: "USD", taxRate: 5, invoicePrefix: "INV", quotationPrefix: "QT", purchasePrefix: "PO", fiscalYearStart: "01-01" };

  return { categories, products, customers, suppliers, invoices, stockMovements, expenses, quotations, purchaseOrders, payments, salesReturns, accounts, journalEntries, warehouses, teamMembers, auditEvents, settings };
}

function emptyState(): ErpState {
  return {
    categories: [], products: [], customers: [], suppliers: [], invoices: [], stockMovements: [], expenses: [], quotations: [], purchaseOrders: [], payments: [], salesReturns: [], accounts: [], journalEntries: [], warehouses: [], teamMembers: [], auditEvents: [],
    settings: { currency: "USD", taxRate: 5, invoicePrefix: "INV", quotationPrefix: "QT", purchasePrefix: "PO", fiscalYearStart: "01-01" },
  };
}

function hydrateState(stored: Partial<ErpState> | null): ErpState {
  const seeded = seedState();
  if (!stored) return seeded;

  return {
    ...seeded,
    ...stored,
    categories: stored.categories ?? seeded.categories,
    products: stored.products ?? seeded.products,
    customers: stored.customers ?? seeded.customers,
    suppliers: stored.suppliers ?? seeded.suppliers,
    invoices: stored.invoices ?? seeded.invoices,
    stockMovements: stored.stockMovements ?? seeded.stockMovements,
    expenses: stored.expenses ?? seeded.expenses,
    quotations: stored.quotations ?? seeded.quotations,
    purchaseOrders: stored.purchaseOrders ?? seeded.purchaseOrders,
    payments: stored.payments ?? seeded.payments,
    salesReturns: stored.salesReturns ?? seeded.salesReturns,
    accounts: stored.accounts ?? seeded.accounts,
    journalEntries: stored.journalEntries ?? seeded.journalEntries,
    warehouses: stored.warehouses ?? seeded.warehouses,
    teamMembers: stored.teamMembers ?? seeded.teamMembers,
    auditEvents: stored.auditEvents ?? seeded.auditEvents,
    settings: { ...seeded.settings, ...stored.settings },
  };
}

function storageKey(companyId: string) {
  return `ledgerpro:erp:v1:${companyId}`;
}

function CompanyErpProvider({ companyId, actor, children }: { companyId: string; actor: string; children: React.ReactNode }) {
  const key = storageKey(companyId);
  const [state, setState] = useState<ErpState>(() => {
    const initialState = hydrateState(readLocalValue<Partial<ErpState>>(key));
    setActiveCurrency(initialState.settings.currency);
    return initialState;
  });

  useEffect(() => {
    writeLocalValue(key, state);
  }, [key, state]);

  function audit(action: string, entity: string, entityId: string): AuditEvent {
    return { id: createId(), action, entity, entityId, actor, createdAt: timestamp() };
  }

  function addCategory(name: string, description: string) {
    const normalizedName = name.trim();
    if (!normalizedName) throw new Error("اسم التصنيف مطلوب.");
    if (state.categories.some((category) => category.name.toLowerCase() === normalizedName.toLowerCase())) throw new Error("التصنيف موجود مسبقًا.");

    const category: Category = { id: createId(), name: normalizedName, description: description.trim(), isActive: true, createdAt: timestamp() };
    setState((current) => ({ ...current, categories: [category, ...current.categories], auditEvents: [audit("أضاف تصنيفًا", "category", category.id), ...current.auditEvents] }));
    return category;
  }

  function removeCategory(id: string) {
    if (state.products.some((product) => product.categoryId === id)) throw new Error("لا يمكن حذف تصنيف مرتبط بمنتجات.");
    setState((current) => ({ ...current, categories: current.categories.filter((category) => category.id !== id), auditEvents: [audit("حذف تصنيفًا", "category", id), ...current.auditEvents] }));
  }

  function validateProduct(input: ProductInput, currentId?: string) {
    if (!input.name.trim() || !input.sku.trim()) throw new Error("اسم المنتج وSKU مطلوبان.");
    if (input.cost < 0 || input.price < 0 || input.stock < 0 || input.lowStockThreshold < 0) throw new Error("القيم الرقمية لا يمكن أن تكون سالبة.");
    if (state.products.some((product) => product.id !== currentId && product.sku.toLowerCase() === input.sku.trim().toLowerCase())) throw new Error("SKU مستخدم لمنتج آخر.");
  }

  function addProduct(input: ProductInput) {
    validateProduct(input);
    const product: Product = { ...input, id: createId(), name: input.name.trim(), sku: input.sku.trim().toUpperCase(), description: input.description.trim(), createdAt: timestamp() };
    const movement: StockMovement | null = product.stock > 0 ? {
      id: createId(), productId: product.id, productName: product.name, type: "opening", quantityDelta: product.stock,
      balanceAfter: product.stock, reference: "رصيد افتتاحي", date: timestamp(),
    } : null;
    setState((current) => ({
      ...current,
      products: [product, ...current.products],
      stockMovements: movement ? [movement, ...current.stockMovements] : current.stockMovements,
      auditEvents: [audit("أضاف منتجًا", "product", product.id), ...current.auditEvents],
    }));
    return product;
  }

  function updateProduct(id: string, input: ProductInput) {
    const existing = state.products.find((product) => product.id === id);
    if (!existing) throw new Error("المنتج غير موجود.");
    validateProduct(input, id);
    const product: Product = { ...existing, ...input, name: input.name.trim(), sku: input.sku.trim().toUpperCase(), description: input.description.trim() };
    const difference = product.stock - existing.stock;
    const movement: StockMovement | null = difference === 0 ? null : {
      id: createId(), productId: product.id, productName: product.name, type: "adjustment", quantityDelta: difference,
      balanceAfter: product.stock, reference: "تعديل المنتج", date: timestamp(),
    };
    setState((current) => ({
      ...current,
      products: current.products.map((item) => item.id === id ? product : item),
      stockMovements: movement ? [movement, ...current.stockMovements] : current.stockMovements,
      auditEvents: [audit("عدّل منتجًا", "product", id), ...current.auditEvents],
    }));
    return product;
  }

  function removeProduct(id: string) {
    const usedInDocuments = state.invoices.some((invoice) => invoice.items.some((item) => item.productId === id))
      || state.quotations.some((quotation) => quotation.items.some((item) => item.productId === id))
      || state.purchaseOrders.some((order) => order.items.some((item) => item.productId === id));
    if (usedInDocuments) throw new Error("لا يمكن حذف منتج مستخدم داخل مستند مالي.");
    setState((current) => ({ ...current, products: current.products.filter((product) => product.id !== id), auditEvents: [audit("حذف منتجًا", "product", id), ...current.auditEvents] }));
  }

  function addCustomer(input: CustomerInput) {
    if (!input.name.trim()) throw new Error("اسم العميل مطلوب.");
    const customer: Customer = { ...input, id: createId(), name: input.name.trim(), createdAt: timestamp() };
    setState((current) => ({ ...current, customers: [customer, ...current.customers], auditEvents: [audit("أضاف عميلًا", "customer", customer.id), ...current.auditEvents] }));
    return customer;
  }

  function updateCustomer(id: string, input: CustomerInput) {
    const existing = state.customers.find((customer) => customer.id === id);
    if (!existing) throw new Error("العميل غير موجود.");
    if (!input.name.trim()) throw new Error("اسم العميل مطلوب.");
    const customer: Customer = { ...existing, ...input, name: input.name.trim() };
    setState((current) => ({ ...current, customers: current.customers.map((item) => item.id === id ? customer : item), auditEvents: [audit("عدّل عميلًا", "customer", id), ...current.auditEvents] }));
    return customer;
  }

  function removeCustomer(id: string) {
    const hasDocuments = state.invoices.some((invoice) => invoice.customerId === id) || state.quotations.some((quotation) => quotation.customerId === id) || state.payments.some((payment) => payment.partyType === "customer" && payment.partyId === id);
    if (hasDocuments) throw new Error("لا يمكن حذف عميل لديه مستندات أو سندات مالية.");
    setState((current) => ({ ...current, customers: current.customers.filter((customer) => customer.id !== id), auditEvents: [audit("حذف عميلًا", "customer", id), ...current.auditEvents] }));
  }

  function addSupplier(input: SupplierInput) {
    if (!input.name.trim()) throw new Error("اسم المورد مطلوب.");
    const supplier: Supplier = { ...input, id: createId(), name: input.name.trim(), createdAt: timestamp() };
    setState((current) => ({ ...current, suppliers: [supplier, ...current.suppliers], auditEvents: [audit("أضاف موردًا", "supplier", supplier.id), ...current.auditEvents] }));
    return supplier;
  }

  function removeSupplier(id: string) {
    const hasDocuments = state.expenses.some((expense) => expense.supplierId === id) || state.purchaseOrders.some((order) => order.supplierId === id) || state.payments.some((payment) => payment.partyType === "supplier" && payment.partyId === id);
    if (hasDocuments) throw new Error("لا يمكن حذف مورد مرتبط بمستندات أو سندات مالية.");
    setState((current) => ({ ...current, suppliers: current.suppliers.filter((supplier) => supplier.id !== id), auditEvents: [audit("حذف موردًا", "supplier", id), ...current.auditEvents] }));
  }

  function addExpense(input: ExpenseInput) {
    if (!input.description.trim() || input.amount <= 0) throw new Error("وصف المصروف والمبلغ الصحيح مطلوبان.");
    const expense: Expense = { ...input, id: createId(), description: input.description.trim(), createdAt: timestamp() };
    setState((current) => ({
      ...current,
      expenses: [expense, ...current.expenses],
      suppliers: expense.supplierId && expense.status === "pending" ? current.suppliers.map((supplier) => supplier.id === expense.supplierId ? { ...supplier, balance: supplier.balance + expense.amount } : supplier) : current.suppliers,
      auditEvents: [audit("سجل مصروفًا", "expense", expense.id), ...current.auditEvents],
    }));
    return expense;
  }

  function removeExpense(id: string) {
    const expense = state.expenses.find((item) => item.id === id);
    if (!expense) return;
    setState((current) => ({
      ...current,
      expenses: current.expenses.filter((item) => item.id !== id),
      suppliers: expense.supplierId && expense.status === "pending" ? current.suppliers.map((supplier) => supplier.id === expense.supplierId ? { ...supplier, balance: Math.max(0, supplier.balance - expense.amount) } : supplier) : current.suppliers,
      auditEvents: [audit("حذف مصروفًا", "expense", id), ...current.auditEvents],
    }));
  }

  function createInvoice(input: InvoiceInput) {
    const customer = state.customers.find((item) => item.id === input.customerId);
    if (!customer) throw new Error("اختر عميلًا صحيحًا.");
    if (input.items.length === 0) throw new Error("أضف منتجًا واحدًا على الأقل.");
    if (new Set(input.items.map((item) => item.productId)).size !== input.items.length) throw new Error("لا يمكن تكرار المنتج داخل الفاتورة.");
    if (!input.issueDate) throw new Error("تاريخ الفاتورة مطلوب.");
    if (!Number.isFinite(input.taxRate) || input.taxRate < 0 || input.taxRate > 100) throw new Error("نسبة الضريبة يجب أن تكون بين 0 و100.");

    const invoiceItems = input.items.map((item) => {
      const product = state.products.find((entry) => entry.id === item.productId);
      if (!product) throw new Error("أحد المنتجات لم يعد متاحًا.");
      if (item.quantity <= 0) throw new Error("كمية المنتج يجب أن تكون أكبر من صفر.");
      if (item.quantity > product.stock) throw new Error(`المخزون المتاح من ${product.name} هو ${product.stock}.`);
      if (item.unitPrice < 0) throw new Error("سعر المنتج غير صحيح.");
      return {
        id: createId(), productId: product.id, productName: product.name, quantity: item.quantity,
        unitPrice: item.unitPrice, unitCost: product.cost, total: item.quantity * item.unitPrice,
      };
    });
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = Math.max(0, input.taxRate);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    const nextNumber = `${state.settings.invoicePrefix}-${String(state.invoices.length + 1).padStart(4, "0")}`;
    const invoice: Invoice = {
      ...input, id: createId(), number: nextNumber, customerName: customer.name, items: invoiceItems,
      subtotal, taxRate, taxAmount, total, createdAt: timestamp(),
    };
    const nextProducts = state.products.map((product) => {
      const invoiceItem = invoiceItems.find((item) => item.productId === product.id);
      return invoiceItem ? { ...product, stock: product.stock - invoiceItem.quantity } : product;
    });
    const movements: StockMovement[] = invoiceItems.map((item) => ({
      id: createId(), productId: item.productId, productName: item.productName, type: "sale",
      quantityDelta: -item.quantity,
      balanceAfter: nextProducts.find((product) => product.id === item.productId)?.stock ?? 0,
      reference: invoice.number,
      date: timestamp(),
    }));
    const balanceDelta = invoice.status === "paid" ? 0 : invoice.total;
    const nextCustomers = state.customers.map((item) => item.id === customer.id ? { ...item, balance: item.balance + balanceDelta } : item);
    setState((current) => ({
      ...current,
      invoices: [invoice, ...current.invoices],
      products: nextProducts,
      customers: nextCustomers,
      stockMovements: [...movements, ...current.stockMovements],
      auditEvents: [audit("أنشأ فاتورة", "invoice", invoice.id), ...current.auditEvents],
    }));
    return invoice;
  }

  function updateInvoiceStatus(id: string, status: InvoiceStatus) {
    const invoice = state.invoices.find((item) => item.id === id);
    if (!invoice || invoice.status === status) return;
    const wasOutstanding = invoice.status !== "paid";
    const isOutstanding = status !== "paid";
    const balanceDelta = wasOutstanding === isOutstanding ? 0 : isOutstanding ? invoice.total : -invoice.total;
    setState((current) => ({
      ...current,
      invoices: current.invoices.map((item) => item.id === id ? { ...item, status } : item),
      customers: current.customers.map((customer) => customer.id === invoice.customerId ? { ...customer, balance: Math.max(0, customer.balance + balanceDelta) } : customer),
      auditEvents: [audit("حدّث حالة فاتورة", "invoice", id), ...current.auditEvents],
    }));
  }

  function createQuotation(input: QuotationInput) {
    const customer = state.customers.find((item) => item.id === input.customerId);
    if (!customer) throw new Error("اختر عميلًا صحيحًا.");
    if (input.items.length === 0) throw new Error("أضف منتجًا واحدًا على الأقل.");
    if (new Set(input.items.map((item) => item.productId)).size !== input.items.length) throw new Error("لا يمكن تكرار المنتج داخل عرض السعر.");
    if (!input.expiryDate || input.expiryDate < input.issueDate) throw new Error("تاريخ انتهاء العرض غير صحيح.");
    if (!Number.isFinite(input.taxRate) || input.taxRate < 0 || input.taxRate > 100) throw new Error("نسبة الضريبة يجب أن تكون بين 0 و100.");

    const items = input.items.map((item) => {
      const product = state.products.find((entry) => entry.id === item.productId);
      if (!product) throw new Error("أحد المنتجات لم يعد متاحًا.");
      if (item.quantity <= 0 || item.unitPrice < 0) throw new Error("بيانات كمية أو سعر المنتج غير صحيحة.");
      return { id: createId(), productId: product.id, productName: product.name, quantity: item.quantity, unitPrice: item.unitPrice, unitCost: product.cost, total: item.quantity * item.unitPrice };
    });
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = Math.max(0, input.taxRate);
    const taxAmount = subtotal * (taxRate / 100);
    const quotation: Quotation = {
      ...input,
      id: createId(),
      number: `${state.settings.quotationPrefix}-${String(state.quotations.length + 1).padStart(4, "0")}`,
      customerName: customer.name,
      items,
      subtotal,
      taxRate,
      taxAmount,
      total: subtotal + taxAmount,
      createdAt: timestamp(),
    };
    setState((current) => ({ ...current, quotations: [quotation, ...current.quotations], auditEvents: [audit("أنشأ عرض سعر", "quotation", quotation.id), ...current.auditEvents] }));
    return quotation;
  }

  function updateQuotationStatus(id: string, status: QuotationStatus) {
    if (!state.quotations.some((quotation) => quotation.id === id)) return;
    setState((current) => ({
      ...current,
      quotations: current.quotations.map((quotation) => quotation.id === id ? { ...quotation, status } : quotation),
      auditEvents: [audit("حدّث حالة عرض سعر", "quotation", id), ...current.auditEvents],
    }));
  }

  function convertQuotationToInvoice(id: string) {
    const quotation = state.quotations.find((item) => item.id === id);
    if (!quotation) throw new Error("عرض السعر غير موجود.");
    if (quotation.convertedInvoiceId) throw new Error("تم تحويل عرض السعر إلى فاتورة مسبقًا.");
    if (quotation.status !== "accepted") throw new Error("يجب اعتماد عرض السعر قبل تحويله إلى فاتورة.");
    const invoice = createInvoice({
      customerId: quotation.customerId,
      issueDate: dateOnly(),
      paymentMethod: "credit",
      status: "sent",
      notes: `محولة من عرض السعر ${quotation.number}${quotation.notes ? ` — ${quotation.notes}` : ""}`,
      taxRate: quotation.taxRate,
      items: quotation.items.map((item) => ({ productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice })),
    });
    setState((current) => ({
      ...current,
      quotations: current.quotations.map((item) => item.id === id ? { ...item, status: "accepted", convertedInvoiceId: invoice.id, convertedInvoiceNumber: invoice.number } : item),
      auditEvents: [audit("حوّل عرض سعر إلى فاتورة", "quotation", id), ...current.auditEvents],
    }));
    return invoice;
  }

  function createPurchaseOrder(input: PurchaseOrderInput) {
    const supplier = state.suppliers.find((item) => item.id === input.supplierId);
    if (!supplier) throw new Error("اختر موردًا صحيحًا.");
    if (input.items.length === 0) throw new Error("أضف منتجًا واحدًا على الأقل.");
    if (new Set(input.items.map((item) => item.productId)).size !== input.items.length) throw new Error("لا يمكن تكرار المنتج داخل أمر الشراء.");
    if (!input.expectedDate || input.expectedDate < input.issueDate) throw new Error("تاريخ التوريد المتوقع غير صحيح.");
    if (!Number.isFinite(input.taxRate) || input.taxRate < 0 || input.taxRate > 100) throw new Error("نسبة الضريبة يجب أن تكون بين 0 و100.");

    const items = input.items.map((item) => {
      const product = state.products.find((entry) => entry.id === item.productId);
      if (!product) throw new Error("أحد المنتجات لم يعد متاحًا.");
      if (item.quantity <= 0 || item.unitCost < 0) throw new Error("بيانات كمية أو تكلفة المنتج غير صحيحة.");
      return { id: createId(), productId: product.id, productName: product.name, quantity: item.quantity, unitCost: item.unitCost, total: item.quantity * item.unitCost };
    });
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = Math.max(0, input.taxRate);
    const taxAmount = subtotal * (taxRate / 100);
    const purchaseOrder: PurchaseOrder = {
      ...input,
      id: createId(),
      number: `${state.settings.purchasePrefix}-${String(state.purchaseOrders.length + 1).padStart(4, "0")}`,
      supplierName: supplier.name,
      items,
      subtotal,
      taxRate,
      taxAmount,
      total: subtotal + taxAmount,
      createdAt: timestamp(),
    };
    setState((current) => ({ ...current, purchaseOrders: [purchaseOrder, ...current.purchaseOrders], auditEvents: [audit("أنشأ أمر شراء", "purchase_order", purchaseOrder.id), ...current.auditEvents] }));
    return purchaseOrder;
  }

  function updatePurchaseOrderStatus(id: string, status: PurchaseOrder["status"]) {
    const purchaseOrder = state.purchaseOrders.find((item) => item.id === id);
    if (!purchaseOrder) throw new Error("أمر الشراء غير موجود.");
    if (purchaseOrder.status === "received") throw new Error("لا يمكن تعديل أمر تم استلامه.");
    if (status === "received") throw new Error("استخدم إجراء الاستلام لتحديث المخزون.");
    if (purchaseOrder.status === "cancelled") throw new Error("لا يمكن إعادة فتح أمر ملغي.");
    setState((current) => ({
      ...current,
      purchaseOrders: current.purchaseOrders.map((item) => item.id === id ? { ...item, status } : item),
      auditEvents: [audit(status === "ordered" ? "أرسل أمر شراء" : "حدّث أمر شراء", "purchase_order", id), ...current.auditEvents],
    }));
  }

  function receivePurchaseOrder(id: string) {
    const purchaseOrder = state.purchaseOrders.find((item) => item.id === id);
    if (!purchaseOrder) throw new Error("أمر الشراء غير موجود.");
    if (purchaseOrder.status === "received") throw new Error("تم استلام أمر الشراء مسبقًا.");
    if (purchaseOrder.status === "cancelled") throw new Error("لا يمكن استلام أمر شراء ملغي.");

    setState((current) => {
      const nextProducts = current.products.map((product) => {
        const item = purchaseOrder.items.find((entry) => entry.productId === product.id);
        return item ? { ...product, stock: product.stock + item.quantity, cost: item.unitCost } : product;
      });
      const movements: StockMovement[] = purchaseOrder.items.map((item) => ({
        id: createId(), productId: item.productId, productName: item.productName, type: "purchase", quantityDelta: item.quantity,
        balanceAfter: nextProducts.find((product) => product.id === item.productId)?.stock ?? item.quantity,
        reference: purchaseOrder.number, date: timestamp(),
      }));
      return {
        ...current,
        products: nextProducts,
        purchaseOrders: current.purchaseOrders.map((item) => item.id === id ? { ...item, status: "received" } : item),
        suppliers: current.suppliers.map((supplier) => supplier.id === purchaseOrder.supplierId ? { ...supplier, balance: supplier.balance + purchaseOrder.total } : supplier),
        stockMovements: [...movements, ...current.stockMovements],
        auditEvents: [audit("استلم أمر شراء", "purchase_order", id), ...current.auditEvents],
      };
    });
  }

  function createPayment(input: PaymentInput) {
    if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("أدخل مبلغًا صحيحًا.");
    const party = input.partyType === "customer"
      ? state.customers.find((customer) => customer.id === input.partyId)
      : input.partyType === "supplier"
        ? state.suppliers.find((supplier) => supplier.id === input.partyId)
        : null;
    if (input.partyType !== "other" && !party) throw new Error("اختر جهة صحيحة.");
    if (!input.date) throw new Error("تاريخ السند مطلوب.");
    if (input.direction === "receipt" && input.partyType === "customer" && party && input.amount > party.balance) throw new Error("مبلغ القبض أكبر من رصيد العميل الحالي.");
    if (input.direction === "payment" && input.partyType === "supplier" && party && input.amount > party.balance) throw new Error("مبلغ الصرف أكبر من رصيد المورد الحالي.");
    const sequence = state.payments.filter((payment) => payment.direction === input.direction).length + 1;
    const payment: Payment = {
      ...input,
      id: createId(),
      number: `${input.direction === "receipt" ? "REC" : "PAY"}-${String(sequence).padStart(4, "0")}`,
      partyName: party?.name ?? "جهة أخرى",
      reference: input.reference.trim(),
      notes: input.notes.trim(),
      createdAt: timestamp(),
    };
    setState((current) => ({
      ...current,
      payments: [payment, ...current.payments],
      customers: input.direction === "receipt" && input.partyType === "customer"
        ? current.customers.map((customer) => customer.id === input.partyId ? { ...customer, balance: Math.max(0, customer.balance - input.amount) } : customer)
        : current.customers,
      suppliers: input.direction === "payment" && input.partyType === "supplier"
        ? current.suppliers.map((supplier) => supplier.id === input.partyId ? { ...supplier, balance: Math.max(0, supplier.balance - input.amount) } : supplier)
        : current.suppliers,
      auditEvents: [audit(input.direction === "receipt" ? "سجل سند قبض" : "سجل سند صرف", "payment", payment.id), ...current.auditEvents],
    }));
    return payment;
  }

  function createSalesReturn(invoiceId: string, reason: string) {
    const invoice = state.invoices.find((item) => item.id === invoiceId);
    if (!invoice) throw new Error("الفاتورة غير موجودة.");
    if (state.salesReturns.some((item) => item.invoiceId === invoiceId)) throw new Error("تم تسجيل مرتجع لهذه الفاتورة مسبقًا.");
    if (invoice.status === "draft") throw new Error("لا يمكن إرجاع فاتورة ما زالت مسودة.");
    if (!reason.trim()) throw new Error("سبب المرتجع مطلوب.");
    const salesReturn: SalesReturn = {
      id: createId(), number: `RET-${String(state.salesReturns.length + 1).padStart(4, "0")}`, invoiceId: invoice.id,
      invoiceNumber: invoice.number, customerId: invoice.customerId, customerName: invoice.customerName, date: dateOnly(),
      reason: reason.trim(), amount: invoice.total, status: "completed", createdAt: timestamp(),
    };
    setState((current) => {
      const nextProducts = current.products.map((product) => {
        const item = invoice.items.find((entry) => entry.productId === product.id);
        return item ? { ...product, stock: product.stock + item.quantity } : product;
      });
      const movements: StockMovement[] = invoice.items.map((item) => ({
        id: createId(), productId: item.productId, productName: item.productName, type: "return", quantityDelta: item.quantity,
        balanceAfter: nextProducts.find((product) => product.id === item.productId)?.stock ?? item.quantity,
        reference: salesReturn.number, date: timestamp(),
      }));
      return {
        ...current,
        products: nextProducts,
        salesReturns: [salesReturn, ...current.salesReturns],
        stockMovements: [...movements, ...current.stockMovements],
        customers: current.customers.map((customer) => customer.id === invoice.customerId ? { ...customer, balance: Math.max(0, customer.balance - invoice.total) } : customer),
        auditEvents: [audit("سجل مرتجع مبيعات", "sales_return", salesReturn.id), ...current.auditEvents],
      };
    });
    return salesReturn;
  }

  function addAccount(input: AccountInput) {
    const code = input.code.trim();
    const name = input.name.trim();
    if (!code || !name) throw new Error("رمز الحساب واسمه مطلوبان.");
    if (state.accounts.some((account) => account.code === code)) throw new Error("رمز الحساب مستخدم مسبقًا.");
    const account: Account = { id: createId(), code, name, type: input.type, balance: 0, isActive: true, createdAt: timestamp() };
    setState((current) => ({ ...current, accounts: [...current.accounts, account].sort((a, b) => a.code.localeCompare(b.code)), auditEvents: [audit("أضاف حسابًا", "account", account.id), ...current.auditEvents] }));
    return account;
  }

  function createJournalEntry(input: JournalEntryInput) {
    if (!input.description.trim()) throw new Error("وصف القيد مطلوب.");
    if (!input.date) throw new Error("تاريخ القيد مطلوب.");
    if (input.lines.length < 2) throw new Error("يجب أن يحتوي القيد على سطرين على الأقل.");
    const lines = input.lines.map((line) => {
      const account = state.accounts.find((item) => item.id === line.accountId);
      if (!account) throw new Error("أحد الحسابات غير موجود.");
      if (line.debit < 0 || line.credit < 0 || (line.debit > 0 && line.credit > 0) || (line.debit === 0 && line.credit === 0)) throw new Error("كل سطر يجب أن يحتوي مبلغًا مدينًا أو دائنًا فقط.");
      return { id: createId(), accountId: account.id, accountName: account.name, debit: line.debit, credit: line.credit };
    });
    const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
    if (totalDebit <= 0 || Math.abs(totalDebit - totalCredit) > 0.001) throw new Error("القيد غير متوازن: يجب أن يتساوى المدين والدائن.");
    const journalEntry: JournalEntry = {
      id: createId(), number: `JE-${String(state.journalEntries.length + 1).padStart(4, "0")}`, date: input.date,
      description: input.description.trim(), status: "posted", lines, totalDebit, totalCredit, createdAt: timestamp(),
    };
    setState((current) => ({
      ...current,
      journalEntries: [journalEntry, ...current.journalEntries],
      accounts: current.accounts.map((account) => {
        const accountLines = lines.filter((line) => line.accountId === account.id);
        const debit = accountLines.reduce((sum, line) => sum + line.debit, 0);
        const credit = accountLines.reduce((sum, line) => sum + line.credit, 0);
        const debitNormal = account.type === "asset" || account.type === "expense";
        return accountLines.length ? { ...account, balance: account.balance + (debitNormal ? debit - credit : credit - debit) } : account;
      }),
      auditEvents: [audit("رحّل قيدًا يوميًا", "journal_entry", journalEntry.id), ...current.auditEvents],
    }));
    return journalEntry;
  }

  function addWarehouse(input: WarehouseInput) {
    if (!input.name.trim()) throw new Error("اسم المستودع مطلوب.");
    if (state.warehouses.some((warehouse) => warehouse.name.toLowerCase() === input.name.trim().toLowerCase())) throw new Error("المستودع موجود مسبقًا.");
    const warehouse: Warehouse = { id: createId(), name: input.name.trim(), location: input.location.trim(), isDefault: state.warehouses.length === 0, isActive: true, createdAt: timestamp() };
    setState((current) => ({ ...current, warehouses: [...current.warehouses, warehouse], auditEvents: [audit("أضاف مستودعًا", "warehouse", warehouse.id), ...current.auditEvents] }));
    return warehouse;
  }

  function addTeamMember(input: TeamMemberInput) {
    const email = input.email.trim().toLowerCase();
    if (!input.name.trim() || !email) throw new Error("اسم العضو وبريده مطلوبان.");
    if (state.teamMembers.some((member) => member.email.toLowerCase() === email)) throw new Error("هذا البريد مضاف مسبقًا.");
    const member: TeamMember = { id: createId(), name: input.name.trim(), email, role: input.role, status: "invited", createdAt: timestamp() };
    setState((current) => ({ ...current, teamMembers: [...current.teamMembers, member], auditEvents: [audit("دعا عضو فريق", "team_member", member.id), ...current.auditEvents] }));
    return member;
  }

  function updateSettings(settings: CompanySettings) {
    if (settings.taxRate < 0 || settings.taxRate > 100) throw new Error("نسبة الضريبة يجب أن تكون بين 0 و100.");
    if (!settings.invoicePrefix.trim() || !settings.quotationPrefix.trim() || !settings.purchasePrefix.trim()) throw new Error("بادئات المستندات مطلوبة.");
    if (!/^\d{2}-\d{2}$/.test(settings.fiscalYearStart)) throw new Error("بداية السنة المالية يجب أن تكون بصيغة MM-DD.");
    const nextSettings = { ...settings, invoicePrefix: settings.invoicePrefix.trim().toUpperCase(), quotationPrefix: settings.quotationPrefix.trim().toUpperCase(), purchasePrefix: settings.purchasePrefix.trim().toUpperCase() };
    setActiveCurrency(nextSettings.currency);
    setState((current) => ({ ...current, settings: nextSettings, auditEvents: [audit("حدّث إعدادات الشركة", "settings", "company"), ...current.auditEvents] }));
  }

  function adjustStock(productId: string, quantityDelta: number, reference: string) {
    if (!Number.isFinite(quantityDelta) || quantityDelta === 0) throw new Error("أدخل كمية تعديل صحيحة.");
    const product = state.products.find((item) => item.id === productId);
    if (!product) throw new Error("المنتج غير موجود.");
    const balanceAfter = product.stock + quantityDelta;
    if (balanceAfter < 0) throw new Error("لا يمكن أن يصبح المخزون سالبًا.");
    const movement: StockMovement = {
      id: createId(), productId, productName: product.name, type: quantityDelta > 0 ? "purchase" : "adjustment",
      quantityDelta, balanceAfter, reference: reference.trim() || "تسوية مخزون", date: timestamp(),
    };
    setState((current) => ({
      ...current,
      products: current.products.map((item) => item.id === productId ? { ...item, stock: balanceAfter } : item),
      stockMovements: [movement, ...current.stockMovements],
      auditEvents: [audit("سجل تسوية مخزون", "stock_movement", movement.id), ...current.auditEvents],
    }));
  }

  function resetDemoData() {
    const freshState = seedState();
    setActiveCurrency(freshState.settings.currency);
    setState(freshState);
    writeLocalValue(key, freshState);
    return freshState;
  }

  const value: ErpContextType = {
    ...state,
    addCategory,
    removeCategory,
    addProduct,
    updateProduct,
    removeProduct,
    addCustomer,
    updateCustomer,
    removeCustomer,
    addSupplier,
    removeSupplier,
    addExpense,
    removeExpense,
    createInvoice,
    updateInvoiceStatus,
    createQuotation,
    updateQuotationStatus,
    convertQuotationToInvoice,
    createPurchaseOrder,
    updatePurchaseOrderStatus,
    receivePurchaseOrder,
    createPayment,
    createSalesReturn,
    addAccount,
    createJournalEntry,
    addWarehouse,
    addTeamMember,
    updateSettings,
    adjustStock,
    resetDemoData,
  };

  return <ErpContext.Provider value={value}>{children}</ErpContext.Provider>;
}

const unavailableValue: ErpContextType = {
  ...emptyState(),
  addCategory: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  removeCategory: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  addProduct: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  updateProduct: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  removeProduct: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  addCustomer: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  updateCustomer: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  removeCustomer: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  addSupplier: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  removeSupplier: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  addExpense: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  removeExpense: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  createInvoice: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  updateInvoiceStatus: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  createQuotation: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  updateQuotationStatus: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  convertQuotationToInvoice: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  createPurchaseOrder: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  updatePurchaseOrderStatus: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  receivePurchaseOrder: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  createPayment: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  createSalesReturn: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  addAccount: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  createJournalEntry: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  addWarehouse: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  addTeamMember: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  updateSettings: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  adjustStock: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  resetDemoData: () => { throw new Error("بيانات الشركة غير جاهزة."); },
};

export function ErpProvider({ children }: { children: React.ReactNode }) {
  const { company } = useCompany();
  const { user } = useAuth();

  if (!company) {
    return <ErpContext.Provider value={unavailableValue}>{children}</ErpContext.Provider>;
  }

  return <CompanyErpProvider key={company.id} companyId={company.id} actor={user?.name ?? "المستخدم الحالي"}>{children}</CompanyErpProvider>;
}

export function useErp() {
  const context = useContext(ErpContext);
  if (!context) throw new Error("useErp must be inside ErpProvider");
  return context;
}
