import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../guards/ProtectedRoute";
import PublicOnlyRoute from "../guards/PublicOnlyRoute";
import DashboardLayout from "../layouts/DashboardLayout";

const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const Invoices = lazy(() => import("../pages/dashboard/Invoices"));
const CreateInvoice = lazy(() => import("../pages/dashboard/CreateInvoice"));
const Products = lazy(() => import("../pages/dashboard/Products"));
const CreateProduct = lazy(() => import("../pages/dashboard/CreateProduct"));
const Categories = lazy(() => import("../pages/dashboard/Categories"));
const Inventory = lazy(() => import("../pages/dashboard/Inventory"));
const Customers = lazy(() => import("../pages/dashboard/Customers"));
const CreateCustomer = lazy(() => import("../pages/dashboard/CreateCustomer"));
const Suppliers = lazy(() => import("../pages/dashboard/Suppliers"));
const Expenses = lazy(() => import("../pages/dashboard/Expenses"));
const Accounts = lazy(() => import("../pages/dashboard/Accounts"));
const Journal = lazy(() => import("../pages/dashboard/Journal"));
const CreateJournal = lazy(() => import("../pages/dashboard/CreateJournal"));
const Reports = lazy(() => import("../pages/dashboard/Reports"));
const AIAssistant = lazy(() => import("../pages/dashboard/AIAssistant"));
const Settings = lazy(() => import("../pages/dashboard/Settings"));

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      <span className="sr-only">جاري تحميل الصفحة...</span>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/create" element={<CreateInvoice />} />
            <Route path="products" element={<Products />} />
            <Route path="products/create" element={<CreateProduct />} />
            <Route path="products/:productId/edit" element={<CreateProduct />} />
            <Route path="categories" element={<Categories />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/create" element={<CreateCustomer />} />
            <Route path="customers/:customerId/edit" element={<CreateCustomer />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="journal" element={<Journal />} />
            <Route path="journal/create" element={<CreateJournal />} />
            <Route path="reports" element={<Reports />} />
            <Route path="ai" element={<AIAssistant />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
