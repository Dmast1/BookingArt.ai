/*
  Warnings:

  - You are about to drop the column `banner` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `endsAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `gallery` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `priceFrom` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `startsAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `ticketsUrl` on the `Event` table. All the data in the column will be lost.
  - Added the required column `date` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Event_city_startsAt_idx";

-- DropIndex
DROP INDEX "public"."Event_status_startsAt_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "banner",
DROP COLUMN "country",
DROP COLUMN "currency",
DROP COLUMN "endsAt",
DROP COLUMN "gallery",
DROP COLUMN "priceFrom",
DROP COLUMN "startsAt",
DROP COLUMN "status",
DROP COLUMN "ticketsUrl",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");

-- CreateIndex
CREATE INDEX "Event_city_date_idx" ON "Event"("city", "date");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
