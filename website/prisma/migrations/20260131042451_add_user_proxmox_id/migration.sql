/*
  Warnings:

  - A unique constraint covering the columns `[proxmoxId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "proxmoxId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_proxmoxId_key" ON "user"("proxmoxId");
