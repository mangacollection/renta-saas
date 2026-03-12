import { api } from "@/lib/axios";

export type TenantPaymentSender = {
  id: string;
  accountId: string;
  tenantId: string;
  email: string;
  bank?: string | null;
  createdAt: string;
};

export async function createTenantPaymentSender(input: {
  tenantId: string;
  email: string;
  bank?: string;
}): Promise<TenantPaymentSender> {
  const res = await api.post<TenantPaymentSender>(
    "/tenant-payment-senders",
    input
  );
  return res.data;
}
