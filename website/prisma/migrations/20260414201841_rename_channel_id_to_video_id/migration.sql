/*
  Warnings:

  - You are about to drop the column `channelId` on the `scenario_livestream` table. All the data in the column will be lost.
  - Added the required column `videoId` to the `scenario_livestream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "scenario_livestream" RENAME COLUMN "channelId" TO "videoId";

