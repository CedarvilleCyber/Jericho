/*
  Warnings:

  - You are about to drop the column `streamUrl` on the `scenario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "scenario" DROP COLUMN "streamUrl",
ADD COLUMN     "youtubeChannelId" TEXT;
