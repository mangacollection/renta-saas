-- CreateTable
CREATE TABLE "GmailWebhookJob" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GmailWebhookJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GmailWebhookJob_status_createdAt_idx" ON "GmailWebhookJob"("status", "createdAt");
