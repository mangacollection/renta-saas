CREATE TABLE "TenantPaymentSender" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "bank" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TenantPaymentSender_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TenantPaymentSender_tenantId_email_key"
  ON "TenantPaymentSender"("tenantId", "email");

CREATE INDEX "TenantPaymentSender_accountId_email_idx"
  ON "TenantPaymentSender"("accountId", "email");

CREATE INDEX "TenantPaymentSender_email_idx"
  ON "TenantPaymentSender"("email");

ALTER TABLE "TenantPaymentSender"
  ADD CONSTRAINT "TenantPaymentSender_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "Account"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TenantPaymentSender"
  ADD CONSTRAINT "TenantPaymentSender_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
