export type BillingStatus = "trial" | "active" | "past_due" | string;

export type AccountPlan = {
  plan: string;
  planPrice: number;
  billingStatus: BillingStatus;
  trialEndsAt: string | null;
  nextPaymentDueAt: string | null;
  daysRemaining: number;
};

export type AccountProfile = {
  email: string;
  role: string;
  phone: string | null;
};