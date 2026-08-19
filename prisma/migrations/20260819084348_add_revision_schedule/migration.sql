-- AlterTable
ALTER TABLE "MicroProofAttempt" ADD COLUMN     "intervalDaysAfterReview" INTEGER;

-- CreateTable
CREATE TABLE "RevisionSchedule" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "nextReviewAt" TIMESTAMP(3) NOT NULL,
    "lastReviewedAt" TIMESTAMP(3) NOT NULL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "currentIntervalDays" INTEGER NOT NULL,
    "lastScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevisionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RevisionSchedule_clerkUserId_idx" ON "RevisionSchedule"("clerkUserId");

-- CreateIndex
CREATE INDEX "RevisionSchedule_nextReviewAt_idx" ON "RevisionSchedule"("nextReviewAt");

-- CreateIndex
CREATE UNIQUE INDEX "RevisionSchedule_clerkUserId_concept_key" ON "RevisionSchedule"("clerkUserId", "concept");

-- AddForeignKey
ALTER TABLE "RevisionSchedule" ADD CONSTRAINT "RevisionSchedule_clerkUserId_concept_fkey" FOREIGN KEY ("clerkUserId", "concept") REFERENCES "ConceptMastery"("clerkUserId", "concept") ON DELETE CASCADE ON UPDATE CASCADE;
