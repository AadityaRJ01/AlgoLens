-- CreateTable
CREATE TABLE "FailureAnalysis" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "rootCause" TEXT NOT NULL,
    "failureCategory" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "preventionRule" TEXT NOT NULL,
    "suggestedFollowUp" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailureAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FailureAnalysis_clerkUserId_idx" ON "FailureAnalysis"("clerkUserId");

-- CreateIndex
CREATE INDEX "FailureAnalysis_submissionId_idx" ON "FailureAnalysis"("submissionId");

-- AddForeignKey
ALTER TABLE "FailureAnalysis" ADD CONSTRAINT "FailureAnalysis_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "LeetCodeSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
