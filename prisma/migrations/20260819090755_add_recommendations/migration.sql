-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "targetConcept" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priorityScore" INTEGER NOT NULL,
    "aiModel" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recommendation_clerkUserId_idx" ON "Recommendation"("clerkUserId");

-- CreateIndex
CREATE INDEX "Recommendation_completedAt_idx" ON "Recommendation"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_clerkUserId_problemId_key" ON "Recommendation"("clerkUserId", "problemId");

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "LeetCodeProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
