/*
  Warnings:

  - Made the column `placeholder` on table `curriculum` required. This step will fail if there are existing NULL values in that column.
  - Made the column `answer` on table `curriculum` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "curriculum" ALTER COLUMN "placeholder" SET NOT NULL,
ALTER COLUMN "answer" SET NOT NULL;

-- AlterTable
ALTER TABLE "scenario" ADD COLUMN     "topologyMap" TEXT;

-- CreateTable
CREATE TABLE "user_scenario" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_answers" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vms" (
    "id" TEXT NOT NULL,
    "vmId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "userScenarioId" TEXT,

    CONSTRAINT "vms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_scenario_userId_scenarioId_key" ON "user_scenario"("userId", "scenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "user_answers_userId_curriculumId_key" ON "user_answers"("userId", "curriculumId");

-- CreateIndex
CREATE UNIQUE INDEX "vms_vmId_key" ON "vms"("vmId");

-- AddForeignKey
ALTER TABLE "user_scenario" ADD CONSTRAINT "user_scenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_scenario" ADD CONSTRAINT "user_scenario_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vms" ADD CONSTRAINT "vms_userScenarioId_fkey" FOREIGN KEY ("userScenarioId") REFERENCES "user_scenario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
