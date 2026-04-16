/*
  Warnings:

  - You are about to drop the column `channelId` on the `scenario_livestream` table. All the data in the column will be lost.
  - You are about to drop the column `videoId` on the `scenario_livestream` table. All the data in the column will be lost.
  - Added the required column `streamKey` to the `scenario_livestream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "scenario_livestream" DROP COLUMN "channelId",
DROP COLUMN "videoId",
ADD COLUMN     "streamKey" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "livestream_page_config" (
    "id" TEXT NOT NULL,
    "layout" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "livestream_page_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livestream_page_stream" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "streamKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "configId" TEXT NOT NULL,

    CONSTRAINT "livestream_page_stream_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "livestream_page_stream" ADD CONSTRAINT "livestream_page_stream_configId_fkey" FOREIGN KEY ("configId") REFERENCES "livestream_page_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;
