import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SubscriptionsPage } from "@/features/subscriptions/SubscriptionsPage";
import { SubscriptionCreatePage } from "@/features/subscriptions/SubscriptionCreatePage";
import InvoicesPage from "@/features/invoices/InvoicesPage";
import AdminAccountPaymentsPage from "@/features/admin/AdminAccountPaymentsPage";
import AdminAccountsPage from "@/features/admin/AdminAccountsPage";
import TenantPaymentsPage from "@/features/tenant-payments/TenantPaymentsPage";
import TenantPaymentSendersPage from "@/features/tenant-payment-senders/TenantPaymentSendersPage";
import AccountPage from "@/features/account/AccountPage";
import MenuPage from "@/pages/MenuPage";
import NotificationsPage from "@/pages/NotificationsPage";
import HelpPage from "@/pages/HelpPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      // 🔹 OWNER APP (con layout)
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <SubscriptionsPage /> },
          { path: "subscriptions/new", element: <SubscriptionCreatePage /> },
          { path: "invoices", element: <InvoicesPage /> },
          { path: "tenant-payments", element: <TenantPaymentsPage /> },
          { path: "tenant-payment-senders", element: <TenantPaymentSendersPage /> },
          { path: "account", element: <AccountPage /> },
          { path: "menu", element: <MenuPage /> },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "help", element: <HelpPage /> },
        ],
      },

      // 🔥 ADMIN SIN LAYOUT
      { path: "admin/account-payments", element: <AdminAccountPaymentsPage /> },
      { path: "admin/accounts", element: <AdminAccountsPage /> },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);