/*
  Warnings:

  - You are about to drop the column `youtubeChannelId` on the `scenario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "scenario" DROP COLUMN "youtubeChannelId";

-- CreateTable
CREATE TABLE "scenario_livestream" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "scenario_livestream_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "scenario_livestream" ADD CONSTRAINT "scenario_livestream_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
