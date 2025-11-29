/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `scenario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "scenario" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "scenario_slug_key" ON "scenario"("slug");
