import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import Invoices from "../pages/dashboard/Invoices";
import CreateInvoice from "../pages/dashboard/CreateInvoice";
import Products from "../pages/dashboard/Products";
import CreateProduct from "../pages/dashboard/CreateProduct";
import Inventory from "../pages/dashboard/Inventory";
import Customers from "../pages/dashboard/Customers";
import CreateCustomer from "../pages/dashboard/CreateCustomer";
import Accounts from "../pages/dashboard/Accounts";
import Journal from "../pages/dashboard/Journal";
import CreateJournal from "../pages/dashboard/CreateJournal";
import Reports from "../pages/dashboard/Reports";
import AIAssistant from "../pages/dashboard/AIAssistant";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute from "../guards/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
          <Route path="inventory" element={<Inventory />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/create" element={<CreateCustomer />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="journal" element={<Journal />} />
          <Route path="journal/create" element={<CreateJournal />} />
          <Route path="reports" element={<Reports />} />
          <Route path="ai" element={<AIAssistant />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}