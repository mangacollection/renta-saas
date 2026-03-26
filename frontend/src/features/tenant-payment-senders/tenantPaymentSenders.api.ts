import { api } from "@/lib/axios";

export type TenantPaymentSender = {
  id: string;
  accountId: string;
  tenantId: string;
  email: string;
  bank?: string | null;
  createdAt: string;
};

// 🔹 LISTAR
export async function getTenantPaymentSenders(): Promise<TenantPaymentSender[]> {
  const res = await api.get<TenantPaymentSender[]>("/tenant-payment-senders");
  return res.data;
}

// 🔹 CREAR
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

export async function updateTenantPaymentSender(
  id: string,
  input: {
    email?: string;
    bank?: string;
  }
): Promise<TenantPaymentSender> {
  const res = await api.patch<TenantPaymentSender>(
    `/tenant-payment-senders/${id}`,
    input
  );
  return res.data;
}

// 🔹 ELIMINAR
export async function deleteTenantPaymentSender(
  id: string
): Promise<void> {
  await api.delete(`/tenant-payment-senders/${id}`);
}