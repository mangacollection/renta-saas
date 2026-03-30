/*
  Warnings:

  - A unique constraint covering the columns `[subscriptionId,type,period]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('initial', 'monthly');

-- CreateEnum
CREATE TYPE "AccountPaymentStatus" AS ENUM ('received', 'approved', 'rejected');

-- AlterEnum
ALTER TYPE "TenantPaymentStatus" ADD VALUE 'overpayment';

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_accountId_fkey";

-- DropIndex
DROP INDEX "Invoice_subscriptionId_period_key";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "billingStartedAt" TIMESTAMP(3),
ADD COLUMN     "billingStatus" TEXT NOT NULL DEFAULT 'trial',
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'early_adopter',
ADD COLUMN     "planPrice" INTEGER NOT NULL DEFAULT 6990,
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "type" "InvoiceType" NOT NULL DEFAULT 'monthly';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "firstInvoiceType" "InvoiceType",
ADD COLUMN     "hasInitialCharges" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "initialCharges" JSONB,
ADD COLUMN     "monthlyBillingStart" TEXT,
ADD COLUMN     "tenantPhone" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT,
ALTER COLUMN "accountId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AccountPayment" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CLP',
    "method" TEXT NOT NULL,
    "channel" TEXT,
    "reference" TEXT,
    "status" "AccountPaymentStatus" NOT NULL DEFAULT 'received',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,

    CONSTRAINT "AccountPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantPaymentSender" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bank" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantPaymentSender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GmailProcessedMessage" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GmailProcessedMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GmailCursor" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "expiration" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GmailCursor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSender" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentSender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountPayment_accountId_createdAt_idx" ON "AccountPayment"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "TenantPaymentSender_accountId_email_idx" ON "TenantPaymentSender"("accountId", "email");

-- CreateIndex
CREATE INDEX "TenantPaymentSender_email_idx" ON "TenantPaymentSender"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TenantPaymentSender_tenantId_email_key" ON "TenantPaymentSender"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "GmailProcessedMessage_messageId_key" ON "GmailProcessedMessage"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSender_email_accountId_key" ON "PaymentSender"("email", "accountId");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "Invoice_subscriptionId_idx" ON "Invoice"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_subscriptionId_type_period_key" ON "Invoice"("subscriptionId", "type", "period");

-- CreateIndex
CREATE INDEX "LedgerEntry_accountId_createdAt_idx" ON "LedgerEntry"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "LedgerEntry_invoiceId_idx" ON "LedgerEntry"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Subscription_accountId_idx" ON "Subscription"("accountId");

-- CreateIndex
CREATE INDEX "SubscriptionItem_subscriptionId_idx" ON "SubscriptionItem"("subscriptionId");

-- AddForeignKey
ALTER TABLE "AccountPayment" ADD CONSTRAINT "AccountPayment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantPaymentSender" ADD CONSTRAINT "TenantPaymentSender_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantPaymentSender" ADD CONSTRAINT "TenantPaymentSender_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSender" ADD CONSTRAINT "PaymentSender_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
