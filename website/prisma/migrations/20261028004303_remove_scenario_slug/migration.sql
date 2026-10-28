/*
  Warnings:

  - You are about to drop the column `slug` on the `scenario` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "scenario_slug_key";

-- AlterTable
ALTER TABLE "scenario" DROP COLUMN "slug";
