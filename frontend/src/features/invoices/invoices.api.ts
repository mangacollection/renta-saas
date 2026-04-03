import { api } from "@/lib/axios";
import type { Invoice, AutomationRecommendation } from "./invoices.types";

export async function getInvoices(subscriptionId: string): Promise<Invoice[]> {
  const res = await api.get<Invoice[]>("/invoices", {
    params: { subscriptionId },
  });
  return res.data;
}

export async function generateMonthAuto(): Promise<{
  created: number;
  skipped: number;
  processed: number;
}> {
  const billingSecret =
    import.meta.env.VITE_BILLING_SECRET ??
    (typeof window !== "undefined"
      ? window.localStorage.getItem("billing_secret") ?? ""
      : "");

  const res = await api.post(
    "/invoices/generate-month-auto",
    undefined,
    {
      headers: {
        "x-billing-secret": billingSecret,
      },
    }
  );

  return res.data;
}

// 🔥 AI — generar mensaje de cobranza
export async function generateCollectionMessage(payload: {
  tenantName: string;
  amount: number;
  daysLate: number;
  dueDate: string;
  propertyName: string;
}) {
  const res = await api.post("/ai/collection-message", payload);
  return res.data;
}
// 🔥 tracking cobranza
export async function createCollectionEvent(payload: {
  invoiceId: string;
  message: string;
}) {
  const res = await api.post("/collection-events", payload);
  return res.data;
}

// 🔥 timeline cobranza
export async function getCollectionEvents(invoiceId: string) {
  const res = await api.get("/collection-events", {
    params: { invoiceId },
  });
  return res.data;
}
export async function getAutomationRecommendations(accountId?: string) {
  const res = await api.get<AutomationRecommendation[]>("/automation/recommendations", {
    params: accountId ? { accountId } : undefined,
  });

  return res.data;
}