/*
  Warnings:

  - You are about to drop the column `skillCategoryId` on the `curriculum` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "curriculum" DROP CONSTRAINT "curriculum_skillCategoryId_fkey";

-- AlterTable
ALTER TABLE "curriculum" DROP COLUMN "skillCategoryId";

-- CreateTable
CREATE TABLE "curriculum_skill_category" (
    "id" SERIAL NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "skillCategoryId" INTEGER NOT NULL,

    CONSTRAINT "curriculum_skill_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_skill_category_curriculumId_skillCategoryId_key" ON "curriculum_skill_category"("curriculumId", "skillCategoryId");

-- AddForeignKey
ALTER TABLE "curriculum_skill_category" ADD CONSTRAINT "curriculum_skill_category_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_skill_category" ADD CONSTRAINT "curriculum_skill_category_skillCategoryId_fkey" FOREIGN KEY ("skillCategoryId") REFERENCES "skill_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
