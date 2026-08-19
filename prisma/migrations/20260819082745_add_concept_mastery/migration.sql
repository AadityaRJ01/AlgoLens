-- CreateTable
CREATE TABLE "ConceptMastery" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "masteryScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "totalMicroProofAttempts" INTEGER NOT NULL DEFAULT 0,
    "averageMicroProofScore" DOUBLE PRECISION,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "successfulProblemCount" INTEGER NOT NULL DEFAULT 0,
    "lastEvaluatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConceptMastery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConceptMastery_clerkUserId_idx" ON "ConceptMastery"("clerkUserId");

-- CreateIndex
CREATE INDEX "ConceptMastery_masteryScore_idx" ON "ConceptMastery"("masteryScore");

-- CreateIndex
CREATE INDEX "ConceptMastery_status_idx" ON "ConceptMastery"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ConceptMastery_clerkUserId_concept_key" ON "ConceptMastery"("clerkUserId", "concept");
