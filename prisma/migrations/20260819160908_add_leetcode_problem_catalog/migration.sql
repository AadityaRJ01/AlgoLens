-- CreateTable
CREATE TABLE "LeetCodeProblemCatalog" (
    "id" TEXT NOT NULL,
    "questionNumber" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "topicTags" TEXT[],
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeetCodeProblemCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeetCodeProblemCatalog_slug_key" ON "LeetCodeProblemCatalog"("slug");

-- CreateIndex
CREATE INDEX "LeetCodeProblemCatalog_difficulty_idx" ON "LeetCodeProblemCatalog"("difficulty");
