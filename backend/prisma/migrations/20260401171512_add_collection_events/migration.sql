-- CreateEnum
CREATE TYPE "CollectionChannel" AS ENUM ('whatsapp');

-- CreateTable
CREATE TABLE "CollectionEvent" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "channel" "CollectionChannel" NOT NULL DEFAULT 'whatsapp',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollectionEvent_accountId_createdAt_idx" ON "CollectionEvent"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "CollectionEvent_invoiceId_createdAt_idx" ON "CollectionEvent"("invoiceId", "createdAt");

-- AddForeignKey
ALTER TABLE "CollectionEvent" ADD CONSTRAINT "CollectionEvent_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionEvent" ADD CONSTRAINT "CollectionEvent_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
