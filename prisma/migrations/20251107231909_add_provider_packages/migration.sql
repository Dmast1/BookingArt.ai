/*
  Warnings:

  - You are about to drop the column `rating` on the `Provider` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('PF', 'COMPANY');

-- DropIndex
DROP INDEX "public"."Provider_city_country_idx";

-- DropIndex
DROP INDEX "public"."Provider_rating_createdAt_idx";

-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "rating",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "businessType" "BusinessType" NOT NULL DEFAULT 'PF',
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "iban" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "regNo" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "vatId" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "categories" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "TicketOrder" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TicketType" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ProviderPackage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "providerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProviderPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderPackage_providerId_sortOrder_idx" ON "ProviderPackage"("providerId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_slug_key" ON "Provider"("slug");

-- AddForeignKey
ALTER TABLE "ProviderPackage" ADD CONSTRAINT "ProviderPackage_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
