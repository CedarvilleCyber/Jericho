/*
  Warnings:

  - You are about to drop the column `skillCategory` on the `curriculum` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "curriculum" DROP COLUMN "skillCategory",
ADD COLUMN     "skillCategoryId" INTEGER;

-- DropEnum
DROP TYPE "public"."SkillCategory";

-- CreateTable
CREATE TABLE "skill_categories" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skill_categories_key_key" ON "skill_categories"("key");

-- AddForeignKey
ALTER TABLE "curriculum" ADD CONSTRAINT "curriculum_skillCategoryId_fkey" FOREIGN KEY ("skillCategoryId") REFERENCES "skill_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
