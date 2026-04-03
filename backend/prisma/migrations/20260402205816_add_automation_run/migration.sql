-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalInvoices" INTEGER NOT NULL,
    "recommendations" INTEGER NOT NULL,

    CONSTRAINT "AutomationRun_pkey" PRIMARY KEY ("id")
);
