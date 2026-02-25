/*
  Warnings:

  - A unique constraint covering the columns `[subscriptionId,period]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Invoice_subscriptionId_period_key" ON "Invoice"("subscriptionId", "period");
