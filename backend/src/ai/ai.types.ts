export type GenerateCollectionMessageInput = {
  tenantName: string;
  amount: number;
  daysLate: number;
  dueDate: string;
  propertyName: string;
};

export type GenerateAccountReminderEmailInput = {
  ownerName: string;
  planName: string;
  amount: number;
  dueDate: string;
  billingStatus: 'active' | 'past_due' | 'trial' | string;
  reminderType: 'before_3d' | 'before_1d' | 'past_due';
};

export type GenerateAccountReminderEmailResult = {
  subject: string;
  title: string;
  message: string;
  ctaLabel: string;
  transferNote: string;
};