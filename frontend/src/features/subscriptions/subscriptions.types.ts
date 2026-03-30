export type SubscriptionStatus = "draft" | "active" | "cancelled";

export type SubscriptionItem = {
  id: string;
  subscriptionId: string;
  type: string;
  name: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

export type Subscription = {
  id: string;
  accountId: string;

  tenantName: string;
  tenantRut: string | null;
  tenantEmail: string | null;
  tenantPhone?: string | null;  // <-- Añadir esta línea

  billingDay: number;
  startDate: string;
  status: SubscriptionStatus;

  createdAt: string;
  updatedAt: string;

  items: SubscriptionItem[];
};

export type CreateSubscriptionInput = {
  tenantName: string;
  tenantRut?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  billingDay?: number;
  startDate?: string;

  // 🟢 NUEVO
  hasInitialCharges?: boolean;
  initialCharges?: {
    label: string;
    amount: number;
  }[];
  monthlyBillingStart?: string;
};

export type AddSubscriptionItemInput = {
  subscriptionId: string;
  type: string;
  name: string;
  amount: number;
};