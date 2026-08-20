// lib/leetcode.js

const LEETCODE_API_URL = 'https://leetcode.com/graphql';

/**
 * Common headers for LeetCode API requests
 */
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Referer': 'https://leetcode.com'
});

/**
 * Wrapper for LeetCode GraphQL fetch
 */
async function fetchGraphQL(query, variables = {}) {
  try {
    const res = await fetch(LEETCODE_API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query, variables })
    });

    if (!res.ok) {
      throw new Error(`LeetCode API responded with status: ${res.status}`);
    }

    const json = await res.json();
    if (json.errors) {
      console.error('LeetCode GraphQL Errors:', json.errors);
      throw new Error(json.errors[0]?.message || 'GraphQL Error');
    }

    return json.data;
  } catch (error) {
    console.error('LeetCode Fetch Error:', error.message);
    throw error;
  }
}

/**
 * Validates a username and fetches their profile stats
 * @param {string} username 
 */
export async function fetchUserProfile(username) {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { username });
  if (!data?.matchedUser) {
    throw new Error('User not found');
  }

  const stats = data.matchedUser.submitStats.acSubmissionNum;
  return {
    username: data.matchedUser.username,
    totalSolved: stats.find(s => s.difficulty === 'All')?.count || 0,
    easySolved: stats.find(s => s.difficulty === 'Easy')?.count || 0,
    mediumSolved: stats.find(s => s.difficulty === 'Medium')?.count || 0,
    hardSolved: stats.find(s => s.difficulty === 'Hard')?.count || 0,
  };
}

/**
 * Fetches recent submissions for a user
 * @param {string} username 
 * @param {number} limit 
 */
export async function fetchRecentSubmissions(username, limit = 20) {
  const query = `
    query getRecentSubmissions($username: String!, $limit: Int!) {
      recentSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
        memory
        runtime
        url
      }
    }
  `;

  const data = await fetchGraphQL(query, { username, limit });
  return data?.recentSubmissionList || [];
}

/**
 * Fetches problem metadata by title slug
 * @param {string} titleSlug 
 */
export async function fetchProblemMetadata(titleSlug) {
  const query = `
    query getQuestionDetail($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionFrontendId
        difficulty
        topicTags {
          name
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { titleSlug });
  return data?.question || null;
}

/**
 * Fetches one page of the public LeetCode problem list (title, slug,
 * difficulty, topic tags) — the same free/unauthenticated GraphQL endpoint
 * used everywhere else in this file. Used to build the global problem
 * catalog (Phase 8), independent of any single user's submissions.
 * Note: LeetCode's public API silently caps `limit` at 100 per request
 * regardless of what's requested here — callers must paginate with `skip`
 * in increments of (at most) 100, not assume the requested limit is honored.
 * @param {number} skip
 * @param {number} limit
 */
export async function fetchProblemCatalogPage(skip = 0, limit = 100) {
  const query = `
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
        total: totalNum
        questions: data {
          questionFrontendId
          title
          titleSlug
          difficulty
          topicTags {
            name
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { categorySlug: "", limit, skip, filters: {} });
  const result = data?.problemsetQuestionList;
  return {
    total: result?.total || 0,
    questions: result?.questions || [],
  };
}

/**
 * Fetches the plain-text problem statement (best-effort) for a problem.
 * LeetCode's public API does not expose constraints as a separate field —
 * they're embedded in the HTML content, so we strip tags and return the text.
 * @param {string} titleSlug
 */
export async function fetchProblemDescription(titleSlug) {
  const query = `
    query getQuestionContent($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        content
      }
    }
  `;

  const data = await fetchGraphQL(query, { titleSlug });
  const html = data?.question?.content;
  if (!html) return null;

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
