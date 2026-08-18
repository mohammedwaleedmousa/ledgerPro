import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpenCheck,
  Bot,
  Boxes,
  FilePlus2,
  FileCheck2,
  FileText,
  HandCoins,
  Landmark,
  LayoutDashboard,
  Package,
  ReceiptText,
  RotateCcw,
  ScrollText,
  Settings2,
  ShoppingCart,
  Tags,
  Truck,
  UserCog,
  Users,
  Warehouse,
} from "lucide-react";

export const appPaths = {
  dashboard: "/app",
  invoices: "/app/invoices",
  createInvoice: "/app/invoices/create",
  invoiceDetails: (invoiceId: string) => `/app/invoices/${invoiceId}`,
  quotations: "/app/quotations",
  payments: "/app/payments",
  salesReturns: "/app/returns",
  purchases: "/app/purchases",
  products: "/app/products",
  createProduct: "/app/products/create",
  categories: "/app/categories",
  inventory: "/app/inventory",
  warehouses: "/app/warehouses",
  customers: "/app/customers",
  createCustomer: "/app/customers/create",
  customerDetails: (customerId: string) => `/app/customers/${customerId}`,
  suppliers: "/app/suppliers",
  expenses: "/app/expenses",
  reports: "/app/reports",
  accounts: "/app/accounts",
  journal: "/app/journal",
  createJournal: "/app/journal/create",
  ai: "/app/ai",
  team: "/app/team",
  activity: "/app/activity",
  settings: "/app/settings",
  editProduct: (productId: string) => `/app/products/${productId}/edit`,
  editCustomer: (customerId: string) => `/app/customers/${customerId}/edit`,
} as const;

export type NavigationItem = {
  name: string;
  path: string;
  icon: LucideIcon;
};

export type NavigationSection = {
  title: string;
  items: NavigationItem[];
};

export const navigationSections: NavigationSection[] = [
  {
    title: "الرئيسية",
    items: [{ name: "لوحة التحكم", path: appPaths.dashboard, icon: LayoutDashboard }],
  },
  {
    title: "المبيعات",
    items: [
      { name: "الفواتير", path: appPaths.invoices, icon: FileText },
      { name: "إنشاء فاتورة", path: appPaths.createInvoice, icon: FilePlus2 },
      { name: "عروض الأسعار", path: appPaths.quotations, icon: FileCheck2 },
      { name: "القبض والصرف", path: appPaths.payments, icon: HandCoins },
      { name: "المرتجعات", path: appPaths.salesReturns, icon: RotateCcw },
    ],
  },
  {
    title: "المشتريات",
    items: [
      { name: "أوامر الشراء", path: appPaths.purchases, icon: ShoppingCart },
      { name: "الموردون", path: appPaths.suppliers, icon: Truck },
    ],
  },
  {
    title: "المنتجات",
    items: [
      { name: "المنتجات", path: appPaths.products, icon: Package },
      { name: "التصنيفات", path: appPaths.categories, icon: Tags },
      { name: "المخزون", path: appPaths.inventory, icon: Boxes },
      { name: "المستودعات", path: appPaths.warehouses, icon: Warehouse },
    ],
  },
  {
    title: "جهات التعامل",
    items: [
      { name: "العملاء", path: appPaths.customers, icon: Users },
    ],
  },
  {
    title: "المالية",
    items: [
      { name: "المصروفات", path: appPaths.expenses, icon: ReceiptText },
      { name: "التقارير", path: appPaths.reports, icon: BarChart3 },
      { name: "دليل الحسابات", path: appPaths.accounts, icon: Landmark },
      { name: "القيود اليومية", path: appPaths.journal, icon: BookOpenCheck },
    ],
  },
  {
    title: "النظام",
    items: [
      { name: "المساعد الذكي", path: appPaths.ai, icon: Bot },
      { name: "الفريق والصلاحيات", path: appPaths.team, icon: UserCog },
      { name: "سجل النشاط", path: appPaths.activity, icon: ScrollText },
      { name: "الإعدادات", path: appPaths.settings, icon: Settings2 },
    ],
  },
];
