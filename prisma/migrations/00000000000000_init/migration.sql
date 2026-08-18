-- CreateTable
CREATE TABLE "LeetCodeAccount" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeetCodeAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeetCodeProblem" (
    "id" TEXT NOT NULL,
    "questionNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleSlug" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "topicTags" TEXT[],
    "url" TEXT,

    CONSTRAINT "LeetCodeProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeetCodeSubmission" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "submissionId" TEXT,
    "verdict" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "runtime" TEXT,
    "memory" TEXT,
    "sourceCode" TEXT,

    CONSTRAINT "LeetCodeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeetCodeAccount_clerkUserId_key" ON "LeetCodeAccount"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "LeetCodeProblem_questionNumber_key" ON "LeetCodeProblem"("questionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LeetCodeProblem_titleSlug_key" ON "LeetCodeProblem"("titleSlug");

-- CreateIndex
CREATE INDEX "LeetCodeSubmission_accountId_idx" ON "LeetCodeSubmission"("accountId");

-- CreateIndex
CREATE INDEX "LeetCodeSubmission_problemId_idx" ON "LeetCodeSubmission"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "LeetCodeSubmission_accountId_submissionId_key" ON "LeetCodeSubmission"("accountId", "submissionId");

-- AddForeignKey
ALTER TABLE "LeetCodeSubmission" ADD CONSTRAINT "LeetCodeSubmission_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LeetCodeAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeetCodeSubmission" ADD CONSTRAINT "LeetCodeSubmission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "LeetCodeProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

