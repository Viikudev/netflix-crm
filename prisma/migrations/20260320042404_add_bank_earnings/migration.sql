-- CreateTable
CREATE TABLE "bank_earnings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "total" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_earnings_pkey" PRIMARY KEY ("id")
);
