-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "featuredUntil" TIMESTAMP(3),
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "featuredUntil" TIMESTAMP(3),
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ProviderPackage" ADD COLUMN     "durationHours" INTEGER,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isHighlight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxPeople" INTEGER,
ADD COLUMN     "tag" TEXT;
