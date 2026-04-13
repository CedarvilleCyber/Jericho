-- CreateTable
CREATE TABLE "user_hint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hintId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_hint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_hint_userId_hintId_key" ON "user_hint"("userId", "hintId");

-- AddForeignKey
ALTER TABLE "user_hint" ADD CONSTRAINT "user_hint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_hint" ADD CONSTRAINT "user_hint_hintId_fkey" FOREIGN KEY ("hintId") REFERENCES "hint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
