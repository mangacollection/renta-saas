import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SubscriptionsPage } from "@/features/subscriptions/SubscriptionsPage";
import { SubscriptionCreatePage } from "@/features/subscriptions/SubscriptionCreatePage";
import InvoicesPage from "@/features/invoices/InvoicesPage";
import AdminAccountPaymentsPage from "@/features/admin/AdminAccountPaymentsPage";
import AdminAccountsPage from "@/features/admin/AdminAccountsPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <SubscriptionsPage /> },
      { path: "subscriptions/new", element: <SubscriptionCreatePage /> },
      { path: "invoices", element: <InvoicesPage /> },
      { path: "admin/account-payments", element: <AdminAccountPaymentsPage /> },
      { path: "admin/accounts", element: <AdminAccountsPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);