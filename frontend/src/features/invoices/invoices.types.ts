export type InvoiceStatus = "pending" | "paid" | "failed" | "void" | string;
export type InvoiceType = "initial" | "monthly" | string;

export type InvoiceItem = {
  id?: string;
  invoiceId?: string;
  label: string;
  amount: number;
  createdAt?: string;
};

export type Invoice = {
  id: string;
  subscriptionId: string;
  period: string;
  total: number;
  status: InvoiceStatus;
  type?: InvoiceType;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItem[];
};
export type RecommendationAction =
  | "none"
  | "send_reminder"
  | "send_firm_message";

export type RecommendationPriority = "low" | "medium" | "high";

export type AutomationRecommendation = {
  invoiceId: string;
  subscriptionId: string;
  action: RecommendationAction;
  priority: RecommendationPriority;
  label: string;
  reason: string;
  daysLate: number;
  dueDate: string;
  status: string;
  total: number;
};