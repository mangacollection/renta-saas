-- CreateTable
CREATE TABLE "PricingConfig" (
    "id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "pricingCode" TEXT NOT NULL,
    "pricingLabel" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PricingConfig_plan_isActive_idx" ON "PricingConfig"("plan", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PricingConfig_plan_pricingCode_key" ON "PricingConfig"("plan", "pricingCode");
