/*
  Warnings:

  - You are about to drop the `AdminAnswers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserConversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminAnswers" DROP CONSTRAINT "AdminAnswers_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "UserConversation" DROP CONSTRAINT "UserConversation_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserRequest" DROP CONSTRAINT "UserRequest_conversationId_fkey";

-- DropTable
DROP TABLE "AdminAnswers";

-- DropTable
DROP TABLE "UserConversation";

-- DropTable
DROP TABLE "UserRequest";
