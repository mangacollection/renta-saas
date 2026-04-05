-- CreateTable
CREATE TABLE "PlatformBillingConfig" (
    "id" TEXT NOT NULL,
    "billingPhone" TEXT,
    "billingBankName" TEXT,
    "billingAccountType" TEXT,
    "billingAccountNumber" TEXT,
    "billingAccountHolder" TEXT,
    "billingAccountRut" TEXT,
    "billingTransferEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformBillingConfig_pkey" PRIMARY KEY ("id")
);
