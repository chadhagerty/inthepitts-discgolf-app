-- CreateTable
CREATE TABLE "StatsOverride" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatsOverride_pkey" PRIMARY KEY ("key")
);
