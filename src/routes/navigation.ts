import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpenCheck,
  Bot,
  Boxes,
  FilePlus2,
  FileText,
  Landmark,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings2,
  Tags,
  Truck,
  Users,
} from "lucide-react";

export const appPaths = {
  dashboard: "/app",
  invoices: "/app/invoices",
  createInvoice: "/app/invoices/create",
  products: "/app/products",
  createProduct: "/app/products/create",
  categories: "/app/categories",
  inventory: "/app/inventory",
  customers: "/app/customers",
  createCustomer: "/app/customers/create",
  suppliers: "/app/suppliers",
  expenses: "/app/expenses",
  reports: "/app/reports",
  accounts: "/app/accounts",
  journal: "/app/journal",
  createJournal: "/app/journal/create",
  ai: "/app/ai",
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
    ],
  },
  {
    title: "المنتجات",
    items: [
      { name: "المنتجات", path: appPaths.products, icon: Package },
      { name: "التصنيفات", path: appPaths.categories, icon: Tags },
      { name: "المخزون", path: appPaths.inventory, icon: Boxes },
    ],
  },
  {
    title: "جهات التعامل",
    items: [
      { name: "العملاء", path: appPaths.customers, icon: Users },
      { name: "الموردون", path: appPaths.suppliers, icon: Truck },
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
      { name: "الإعدادات", path: appPaths.settings, icon: Settings2 },
    ],
  },
];
