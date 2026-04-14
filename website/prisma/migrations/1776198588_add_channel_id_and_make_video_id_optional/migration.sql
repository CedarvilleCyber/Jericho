-- AlterTable
ALTER TABLE "scenario_livestream" 
  ADD COLUMN "channelId" TEXT NOT NULL DEFAULT 'UNKNOWN',
  ALTER COLUMN "videoId" DROP NOT NULL;

-- Remove the default so future inserts require explicit channelId
ALTER TABLE "scenario_livestream" 
  ALTER COLUMN "channelId" DROP DEFAULT;
