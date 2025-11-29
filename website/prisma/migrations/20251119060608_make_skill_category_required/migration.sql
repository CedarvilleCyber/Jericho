/*
  Warnings:

  - Made the column `skillCategoryId` on table `curriculum` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."curriculum" DROP CONSTRAINT "curriculum_skillCategoryId_fkey";

-- AlterTable
ALTER TABLE "curriculum" ALTER COLUMN "skillCategoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "curriculum" ADD CONSTRAINT "curriculum_skillCategoryId_fkey" FOREIGN KEY ("skillCategoryId") REFERENCES "skill_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
