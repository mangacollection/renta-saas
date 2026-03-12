import { api } from "@/lib/axios";

export type TenantPayment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  channel: string;
  reference?: string | null;
  paidAt?: string | null;
  createdAt: string;

  tenant: {
    id: string;
    name: string;
    email?: string | null;
  };

  subscription: {
    id: string;
    tenantName: string;
  };

  invoice?: {
    id: string;
    total: number;
    status: string;
  } | null;
};

export async function getTenantPayments(): Promise<TenantPayment[]> {
  const res = await api.get<TenantPayment[]>("/tenant-payments");
  return res.data;
}
