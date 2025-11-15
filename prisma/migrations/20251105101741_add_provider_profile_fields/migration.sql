-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "websiteUrl" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "language" DROP DEFAULT;
