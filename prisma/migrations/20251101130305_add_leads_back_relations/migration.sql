/*
  Warnings:

  - The `categories` column on the `Provider` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('venue', 'provider', 'unknown');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'contacted', 'converted', 'rejected');

-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "categories",
ADD COLUMN     "categories" TEXT[];

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT DEFAULT 'RO',
    "capacityMin" INTEGER,
    "capacityMax" INTEGER,
    "priceFrom" INTEGER,
    "priceTo" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "rating" DOUBLE PRECISION,
    "images" TEXT[],
    "features" TEXT[],

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "source" "LeadSource" NOT NULL DEFAULT 'unknown',
    "status" "LeadStatus" NOT NULL DEFAULT 'new',
    "venueId" TEXT,
    "providerId" TEXT,
    "email" TEXT NOT NULL,
    "city" TEXT,
    "time" TEXT,
    "date" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Venue_city_country_idx" ON "Venue"("city", "country");

-- CreateIndex
CREATE INDEX "Venue_rating_createdAt_idx" ON "Venue"("rating", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_source_createdAt_idx" ON "Lead"("source", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Provider_rating_createdAt_idx" ON "Provider"("rating", "createdAt");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
