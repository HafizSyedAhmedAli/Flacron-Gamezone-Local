-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "streamTitle" TEXT,
ADD COLUMN     "youtubeVideoId" TEXT;
