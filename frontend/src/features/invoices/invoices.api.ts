import { api } from "@/lib/axios";
import type { Invoice } from "./invoices.types";

export async function getInvoices(subscriptionId: string): Promise<Invoice[]> {
  const res = await api.get<Invoice[]>("/invoices", {
    params: { subscriptionId },
  });
  return res.data;
}