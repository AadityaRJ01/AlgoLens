-- CreateTable
CREATE TABLE "Concept" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "submissionId" TEXT,
    "name" TEXT NOT NULL,
    "coreIdea" TEXT NOT NULL,
    "invariant" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Concept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MicroProof" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "expectedPoints" JSONB NOT NULL,
    "userAnswer" TEXT,
    "score" INTEGER,
    "understanding" TEXT,
    "whatWasCorrect" TEXT,
    "missingPoints" JSONB,
    "feedback" TEXT,
    "aiModel" TEXT,
    "evaluatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MicroProof_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Concept_clerkUserId_idx" ON "Concept"("clerkUserId");

-- CreateIndex
CREATE INDEX "Concept_submissionId_idx" ON "Concept"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Concept_clerkUserId_problemId_key" ON "Concept"("clerkUserId", "problemId");

-- CreateIndex
CREATE INDEX "MicroProof_clerkUserId_idx" ON "MicroProof"("clerkUserId");

-- CreateIndex
CREATE INDEX "MicroProof_conceptId_idx" ON "MicroProof"("conceptId");

-- AddForeignKey
ALTER TABLE "Concept" ADD CONSTRAINT "Concept_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "LeetCodeProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concept" ADD CONSTRAINT "Concept_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "LeetCodeSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroProof" ADD CONSTRAINT "MicroProof_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;
