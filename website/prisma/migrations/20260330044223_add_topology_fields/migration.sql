-- AlterTable
ALTER TABLE "scenario" ADD COLUMN     "topology" JSONB;

-- AlterTable
ALTER TABLE "user_scenario" ADD COLUMN     "hintsUsed" INTEGER NOT NULL DEFAULT 0;
