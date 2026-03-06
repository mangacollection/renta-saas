export type InvoiceStatus = "pending" | "paid" | "failed" | "void" | string;

export type Invoice = {
  id: string;
  subscriptionId: string;
  period: string;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};