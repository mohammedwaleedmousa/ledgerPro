import { createContext, useContext, useEffect, useState } from "react";
import { readLocalValue, writeLocalValue } from "../lib/demo";
import type {
  Category,
  Customer,
  CustomerInput,
  ErpState,
  Expense,
  ExpenseInput,
  Invoice,
  InvoiceInput,
  InvoiceStatus,
  Product,
  ProductInput,
  StockMovement,
  Supplier,
  SupplierInput,
} from "../types/erp";
import { useCompany } from "./CompanyContext";

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
  adjustStock: (productId: string, quantityDelta: number, reference: string) => void;
  resetDemoData: () => void;
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

  return { categories, products, customers, suppliers, invoices, stockMovements, expenses };
}

function emptyState(): ErpState {
  return { categories: [], products: [], customers: [], suppliers: [], invoices: [], stockMovements: [], expenses: [] };
}

function storageKey(companyId: string) {
  return `ledgerpro:erp:v1:${companyId}`;
}

function CompanyErpProvider({ companyId, children }: { companyId: string; children: React.ReactNode }) {
  const key = storageKey(companyId);
  const [state, setState] = useState<ErpState>(() => readLocalValue<ErpState>(key) ?? seedState());

  useEffect(() => {
    writeLocalValue(key, state);
  }, [key, state]);

  function addCategory(name: string, description: string) {
    const normalizedName = name.trim();
    if (!normalizedName) throw new Error("اسم التصنيف مطلوب.");
    if (state.categories.some((category) => category.name.toLowerCase() === normalizedName.toLowerCase())) throw new Error("التصنيف موجود مسبقًا.");

    const category: Category = { id: createId(), name: normalizedName, description: description.trim(), isActive: true, createdAt: timestamp() };
    setState((current) => ({ ...current, categories: [category, ...current.categories] }));
    return category;
  }

  function removeCategory(id: string) {
    if (state.products.some((product) => product.categoryId === id)) throw new Error("لا يمكن حذف تصنيف مرتبط بمنتجات.");
    setState((current) => ({ ...current, categories: current.categories.filter((category) => category.id !== id) }));
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
    }));
    return product;
  }

  function removeProduct(id: string) {
    if (state.invoices.some((invoice) => invoice.items.some((item) => item.productId === id))) throw new Error("لا يمكن حذف منتج مستخدم داخل فاتورة.");
    setState((current) => ({ ...current, products: current.products.filter((product) => product.id !== id) }));
  }

  function addCustomer(input: CustomerInput) {
    if (!input.name.trim()) throw new Error("اسم العميل مطلوب.");
    const customer: Customer = { ...input, id: createId(), name: input.name.trim(), createdAt: timestamp() };
    setState((current) => ({ ...current, customers: [customer, ...current.customers] }));
    return customer;
  }

  function updateCustomer(id: string, input: CustomerInput) {
    const existing = state.customers.find((customer) => customer.id === id);
    if (!existing) throw new Error("العميل غير موجود.");
    if (!input.name.trim()) throw new Error("اسم العميل مطلوب.");
    const customer: Customer = { ...existing, ...input, name: input.name.trim() };
    setState((current) => ({ ...current, customers: current.customers.map((item) => item.id === id ? customer : item) }));
    return customer;
  }

  function removeCustomer(id: string) {
    if (state.invoices.some((invoice) => invoice.customerId === id)) throw new Error("لا يمكن حذف عميل لديه فواتير.");
    setState((current) => ({ ...current, customers: current.customers.filter((customer) => customer.id !== id) }));
  }

  function addSupplier(input: SupplierInput) {
    if (!input.name.trim()) throw new Error("اسم المورد مطلوب.");
    const supplier: Supplier = { ...input, id: createId(), name: input.name.trim(), createdAt: timestamp() };
    setState((current) => ({ ...current, suppliers: [supplier, ...current.suppliers] }));
    return supplier;
  }

  function removeSupplier(id: string) {
    if (state.expenses.some((expense) => expense.supplierId === id)) throw new Error("لا يمكن حذف مورد مرتبط بمصروفات.");
    setState((current) => ({ ...current, suppliers: current.suppliers.filter((supplier) => supplier.id !== id) }));
  }

  function addExpense(input: ExpenseInput) {
    if (!input.description.trim() || input.amount <= 0) throw new Error("وصف المصروف والمبلغ الصحيح مطلوبان.");
    const expense: Expense = { ...input, id: createId(), description: input.description.trim(), createdAt: timestamp() };
    setState((current) => ({ ...current, expenses: [expense, ...current.expenses] }));
    return expense;
  }

  function removeExpense(id: string) {
    setState((current) => ({ ...current, expenses: current.expenses.filter((expense) => expense.id !== id) }));
  }

  function createInvoice(input: InvoiceInput) {
    const customer = state.customers.find((item) => item.id === input.customerId);
    if (!customer) throw new Error("اختر عميلًا صحيحًا.");
    if (input.items.length === 0) throw new Error("أضف منتجًا واحدًا على الأقل.");
    if (new Set(input.items.map((item) => item.productId)).size !== input.items.length) throw new Error("لا يمكن تكرار المنتج داخل الفاتورة.");

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
    const nextNumber = `INV-${String(state.invoices.length + 1).padStart(4, "0")}`;
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
    }));
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
    }));
  }

  function resetDemoData() {
    const freshState = seedState();
    setState(freshState);
    writeLocalValue(key, freshState);
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
  adjustStock: () => { throw new Error("بيانات الشركة غير جاهزة."); },
  resetDemoData: () => { throw new Error("بيانات الشركة غير جاهزة."); },
};

export function ErpProvider({ children }: { children: React.ReactNode }) {
  const { company } = useCompany();

  if (!company) {
    return <ErpContext.Provider value={unavailableValue}>{children}</ErpContext.Provider>;
  }

  return <CompanyErpProvider key={company.id} companyId={company.id}>{children}</CompanyErpProvider>;
}

export function useErp() {
  const context = useContext(ErpContext);
  if (!context) throw new Error("useErp must be inside ErpProvider");
  return context;
}
