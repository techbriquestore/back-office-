import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "@/layouts/AdminLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import LoginPage from "@/features/auth/LoginPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import OrdersListPage from "@/features/orders/OrdersListPage";
import OrderDetailPage from "@/features/orders/OrderDetailPage";
import PreordersListPage from "@/features/preorders/PreordersListPage";
import PreorderDetailPage from "@/features/preorders/PreorderDetailPage";
import ProductsListPage from "@/features/products/ProductsListPage";
import ProductFormPage from "@/features/products/ProductFormPage";
import StockPage from "@/features/stock/StockPage";
import StockEntryPage from "@/features/stock/StockEntryPage";
import StockHistoryPage from "@/features/stock/StockHistoryPage";
import LogisticsPage from "@/features/logistics/LogisticsPage";
import CustomersListPage from "@/features/customers/CustomersListPage";
import CustomerDetailPage from "@/features/customers/CustomerDetailPage";
import ClaimsListPage from "@/features/claims/ClaimsListPage";
import ClaimDetailPage from "@/features/claims/ClaimDetailPage";
import ReportsPage from "@/features/reports/ReportsPage";
import SettingsPage from "@/features/settings/SettingsPage";
import ProfilePage from "@/features/auth/ProfilePage";
import ChangePasswordPage from "@/features/auth/ChangePasswordPage";
import PaymentsPage from "@/features/payments/PaymentsPage";
import PromotionsPage from "@/features/promotions/PromotionsPage";
import InvoicesPage from "@/features/invoices/InvoicesPage";
import InventoryPage from "@/features/stock/InventoryPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<ProtectedRoute module="dashboard"><DashboardPage /></ProtectedRoute>} />

            <Route path="orders" element={<ProtectedRoute module="orders"><OrdersListPage /></ProtectedRoute>} />
            <Route path="orders/:id" element={<ProtectedRoute module="orders"><OrderDetailPage /></ProtectedRoute>} />

            <Route path="preorders" element={<ProtectedRoute module="preorders"><PreordersListPage /></ProtectedRoute>} />
            <Route path="preorders/:id" element={<ProtectedRoute module="preorders"><PreorderDetailPage /></ProtectedRoute>} />

            <Route path="products" element={<ProtectedRoute module="products"><ProductsListPage /></ProtectedRoute>} />
            <Route path="products/new" element={<ProtectedRoute module="products"><ProductFormPage /></ProtectedRoute>} />
            <Route path="products/:id/edit" element={<ProtectedRoute module="products"><ProductFormPage /></ProtectedRoute>} />

            <Route path="stock" element={<ProtectedRoute module="stock"><StockPage /></ProtectedRoute>} />
            <Route path="stock/entry" element={<ProtectedRoute module="stock"><StockEntryPage /></ProtectedRoute>} />
            <Route path="stock/history" element={<ProtectedRoute module="stock"><StockHistoryPage /></ProtectedRoute>} />
            <Route path="stock/inventory" element={<ProtectedRoute module="stock"><InventoryPage /></ProtectedRoute>} />

            <Route path="logistics" element={<ProtectedRoute module="logistics"><LogisticsPage /></ProtectedRoute>} />

            <Route path="customers" element={<ProtectedRoute module="customers"><CustomersListPage /></ProtectedRoute>} />
            <Route path="customers/:id" element={<ProtectedRoute module="customers"><CustomerDetailPage /></ProtectedRoute>} />

            <Route path="claims" element={<ProtectedRoute module="claims"><ClaimsListPage /></ProtectedRoute>} />
            <Route path="claims/:id" element={<ProtectedRoute module="claims"><ClaimDetailPage /></ProtectedRoute>} />

            <Route path="reports" element={<ProtectedRoute module="reports"><ReportsPage /></ProtectedRoute>} />

            <Route path="payments" element={<ProtectedRoute module="orders"><PaymentsPage /></ProtectedRoute>} />
            <Route path="promotions" element={<ProtectedRoute module="products"><PromotionsPage /></ProtectedRoute>} />
            <Route path="invoices" element={<ProtectedRoute module="orders"><InvoicesPage /></ProtectedRoute>} />

            <Route path="profile" element={<ProfilePage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />

            <Route path="settings" element={<ProtectedRoute module="settings"><SettingsPage /></ProtectedRoute>} />

            {/* Default redirect */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
