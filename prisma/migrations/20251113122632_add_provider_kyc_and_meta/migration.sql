-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "DocumentKind" AS ENUM ('IDENTITY', 'COMPANY', 'OTHER');

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "kycNote" TEXT,
ADD COLUMN     "kycStatus" "KycStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "meta" JSONB;

-- CreateTable
CREATE TABLE "ProviderDocument" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providerId" TEXT NOT NULL,
    "kind" "DocumentKind" NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "note" TEXT,
    "status" "KycStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "ProviderDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderDocument_providerId_kind_status_idx" ON "ProviderDocument"("providerId", "kind", "status");

-- AddForeignKey
ALTER TABLE "ProviderDocument" ADD CONSTRAINT "ProviderDocument_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
