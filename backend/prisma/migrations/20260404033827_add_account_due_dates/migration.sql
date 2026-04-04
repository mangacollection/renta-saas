-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "lastPaymentAt" TIMESTAMP(3),
ADD COLUMN     "nextPaymentDueAt" TIMESTAMP(3);
