-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "lastReminderSentAt" TIMESTAMP(3),
ADD COLUMN     "lastReminderType" TEXT;
