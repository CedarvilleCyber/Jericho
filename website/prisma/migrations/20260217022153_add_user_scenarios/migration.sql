-- CreateTable
CREATE TABLE "user_scenario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "vmId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "user_scenario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_scenario_userId_scenarioId_key" ON "user_scenario"("userId", "scenarioId");

-- AddForeignKey
ALTER TABLE "user_scenario" ADD CONSTRAINT "user_scenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_scenario" ADD CONSTRAINT "user_scenario_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_scenario" ADD CONSTRAINT "user_scenario_vmId_fkey" FOREIGN KEY ("vmId") REFERENCES "vm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
