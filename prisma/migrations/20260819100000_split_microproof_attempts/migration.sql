-- CreateTable
CREATE TABLE "MicroProofAttempt" (
    "id" TEXT NOT NULL,
    "microProofId" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "understanding" TEXT NOT NULL,
    "whatWasCorrect" TEXT NOT NULL,
    "missingPoints" JSONB NOT NULL,
    "feedback" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MicroProofAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MicroProofAttempt_clerkUserId_idx" ON "MicroProofAttempt"("clerkUserId");

-- CreateIndex
CREATE INDEX "MicroProofAttempt_microProofId_idx" ON "MicroProofAttempt"("microProofId");

-- AddForeignKey
ALTER TABLE "MicroProofAttempt" ADD CONSTRAINT "MicroProofAttempt_microProofId_fkey" FOREIGN KEY ("microProofId") REFERENCES "MicroProof"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: preserve any existing single answer on MicroProof as its first attempt
-- before the old columns are dropped below.
INSERT INTO "MicroProofAttempt" ("id", "microProofId", "clerkUserId", "answer", "score", "understanding", "whatWasCorrect", "missingPoints", "feedback", "aiModel", "createdAt")
SELECT
    gen_random_uuid()::text,
    "id",
    "clerkUserId",
    "userAnswer",
    "score",
    "understanding",
    "whatWasCorrect",
    "missingPoints",
    "feedback",
    COALESCE("aiModel", 'unknown'),
    COALESCE("evaluatedAt", "createdAt")
FROM "MicroProof"
WHERE "userAnswer" IS NOT NULL
    AND "score" IS NOT NULL
    AND "understanding" IS NOT NULL
    AND "whatWasCorrect" IS NOT NULL
    AND "missingPoints" IS NOT NULL
    AND "feedback" IS NOT NULL;

-- AlterTable
ALTER TABLE "MicroProof" DROP COLUMN "evaluatedAt",
DROP COLUMN "feedback",
DROP COLUMN "missingPoints",
DROP COLUMN "score",
DROP COLUMN "understanding",
DROP COLUMN "userAnswer",
DROP COLUMN "whatWasCorrect",
ALTER COLUMN "aiModel" SET NOT NULL;
