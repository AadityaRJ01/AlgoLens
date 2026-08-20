// lib/leetcodeCatalog.js
//
// Phase 8: Global LeetCode Problem Catalog sync. Server-only.
//
// Populates LeetCodeProblemCatalog — a public, read-only pool of real
// LeetCode problems independent of any user's submission history — from
// LeetCode's public GraphQL API (free, unauthenticated; the same source
// lib/leetcode.js already uses for Phase 3). This is what makes it possible
// to recommend problems a user hasn't personally synced/solved.
//
// Never touches LeetCodeAccount, LeetCodeSubmission, or any user-specific
// data. Safe to run repeatedly: every problem is upserted by its unique
// slug, so re-running never creates duplicates.

import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { fetchProblemCatalogPage } from "@/lib/leetcode";

// LeetCode's public API silently caps `limit` at 100 per request no matter
// what's requested, so pagination must advance `skip` by 100 each time —
// see the note on fetchProblemCatalogPage.
const PAGE_SIZE = 100;
const DEFAULT_MAX_PAGES = 15; // ~1500 real problems — well beyond "several hundred".

/**
 * Fetches pages of the public LeetCode problem list and upserts them into
 * LeetCodeProblemCatalog. Stops early on the first page that fails or comes
 * back short (end of the catalog) rather than failing the whole sync —
 * whatever was fetched so far is still committed.
 *
 * @param {{maxPages?: number}} [options]
 * @returns {Promise<{imported:number, updated:number, fetched:number, total:number|null, error:string|null}>}
 */
export async function syncLeetCodeProblemCatalog({ maxPages = DEFAULT_MAX_PAGES } = {}) {
  let fetched = 0;
  let imported = 0;
  let updated = 0;
  let total = null;
  let error = null;

  for (let page = 0; page < maxPages; page++) {
    let batch;
    try {
      batch = await fetchProblemCatalogPage(page * PAGE_SIZE, PAGE_SIZE);
    } catch (err) {
      console.error("[CATALOG_SYNC_FETCH_ERROR]", err.message);
      error = fetched === 0 ? "Could not reach the LeetCode problem catalog source." : null;
      break;
    }

    total = batch.total || total;

    const valid = batch.questions.filter((q) => q.titleSlug && q.title && q.difficulty);
    if (!valid.length) break;

    const slugs = valid.map((q) => q.titleSlug);
    const existingSlugs = new Set(
      (
        await prisma.leetCodeProblemCatalog.findMany({
          where: { slug: { in: slugs } },
          select: { slug: true },
        })
      ).map((p) => p.slug)
    );

    // One bulk INSERT ... ON CONFLICT per page instead of ~100 individual
    // upserts — each Prisma query is its own round trip to Neon, and at
    // 1500+ problems that made a naive per-row upsert take minutes (risking
    // a serverless function timeout on a user-triggered sync).
    const rows = valid.map((q) =>
      Prisma.sql`(${randomUUID()}, ${q.questionFrontendId || null}, ${q.title}, ${q.titleSlug}, ${q.difficulty}, ${(q.topicTags || []).map((t) => t.name)}, ${`https://leetcode.com/problems/${q.titleSlug}/`}, now(), now())`
    );

    await prisma.$executeRaw`
      INSERT INTO "LeetCodeProblemCatalog"
        (id, "questionNumber", title, slug, difficulty, "topicTags", url, "createdAt", "updatedAt")
      VALUES ${Prisma.join(rows)}
      ON CONFLICT (slug) DO UPDATE SET
        "questionNumber" = EXCLUDED."questionNumber",
        title = EXCLUDED.title,
        difficulty = EXCLUDED.difficulty,
        "topicTags" = EXCLUDED."topicTags",
        url = EXCLUDED.url,
        "updatedAt" = now()
    `;

    imported += valid.filter((q) => !existingSlugs.has(q.titleSlug)).length;
    updated += valid.filter((q) => existingSlugs.has(q.titleSlug)).length;
    fetched += valid.length;

    if (batch.questions.length < PAGE_SIZE) break; // reached the end
  }

  if (fetched === 0 && !error) {
    error = "The LeetCode catalog source returned no problems.";
  }

  return { imported, updated, fetched, total, error };
}

/**
 * @returns {Promise<number>} how many problems are currently in the global catalog.
 */
export async function getCatalogProblemCount() {
  return prisma.leetCodeProblemCatalog.count();
}
