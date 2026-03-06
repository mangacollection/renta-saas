export type BillingStatus = "trial" | "active" | "past_due" | string;

export type AccountPlan = {
  plan: string;
  planPrice: number;
  billingStatus: BillingStatus;
  trialEndsAt: string | null;
  daysRemaining: number;
};
