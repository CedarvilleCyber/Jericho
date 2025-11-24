/*
  Warnings:

  - Added the required column `skillCategory` to the `curriculum` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isCorrect` to the `user_answers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('ENUMERATION', 'WEB_EXPLOITATION', 'AD_EXPLOITATION', 'WINDOWS_PRIVESC', 'LINUX_PRIVESC', 'POST_EXPLOITATION');

-- DropForeignKey
ALTER TABLE "public"."curriculum" DROP CONSTRAINT "curriculum_scenarioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vms" DROP CONSTRAINT "vms_userScenarioId_fkey";

-- AlterTable
ALTER TABLE "curriculum" ADD COLUMN     "pointValue" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "skillCategory" "SkillCategory" NOT NULL;

-- AlterTable
ALTER TABLE "user_answers" ADD COLUMN     "isCorrect" BOOLEAN NOT NULL;

-- AddForeignKey
ALTER TABLE "curriculum" ADD CONSTRAINT "curriculum_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vms" ADD CONSTRAINT "vms_userScenarioId_fkey" FOREIGN KEY ("userScenarioId") REFERENCES "user_scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
