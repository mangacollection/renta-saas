import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";
import AdminLayout from "@/layouts/AdminLayout";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SubscriptionsPage } from "@/features/subscriptions/SubscriptionsPage";
import { SubscriptionCreatePage } from "@/features/subscriptions/SubscriptionCreatePage";
import InvoicesPage from "@/features/invoices/InvoicesPage";
import AdminAccountPaymentsPage from "@/features/admin/AdminAccountPaymentsPage";
import AdminAccountsPage from "@/features/admin/AdminAccountsPage";
import AdminObservabilityPage from "@/features/admin/AdminObservabilityPage";
import TenantPaymentsPage from "@/features/tenant-payments/TenantPaymentsPage";
import TenantPaymentSendersPage from "@/features/tenant-payment-senders/TenantPaymentSendersPage";
import AccountPage from "@/features/account/AccountPage";
import MenuPage from "@/pages/MenuPage";
import NotificationsPage from "@/pages/NotificationsPage";
import HelpPage from "@/pages/HelpPage";
import AdminPricingPage from "@/features/admin/AdminPricingPage";
import LandingPage from "@/pages/public/LandingPage";
import SignupPage from "@/pages/public/SignupPage";
import ThanksPage from "@/pages/public/ThanksPage";
import AdminLeadsPage from "@/features/admin/AdminLeadsPage";

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/gracias", element: <ThanksPage /> },

  {
    path: "/app",
    element: <ProtectedRoute />,
    children: [
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

      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { path: "account-payments", element: <AdminAccountPaymentsPage /> },
          { path: "accounts", element: <AdminAccountsPage /> },
          { path: "observability", element: <AdminObservabilityPage /> },
          { path: "pricing", element: <AdminPricingPage /> },
          { path: "leads", element: <AdminLeadsPage /> },
        ],
      },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);