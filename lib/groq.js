// lib/groq.js
//
// Server-only service for diagnosing why a LeetCode submission failed.
// This file must never be imported from a Client Component — it reads
// GROQ_API_KEY (a server-only env var, no NEXT_PUBLIC_ prefix) and calls
// the Groq API directly.

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// A strong coding/reasoning model on Groq with a large (128k) context window,
// so full problem statements + user source code comfortably fit in one call.
// Overridable via env in case the model is deprecated/renamed by Groq.
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

const ALLOWED_FAILURE_CATEGORIES = [
  "Logic Error",
  "Boundary Condition",
  "Incorrect Invariant",
  "Wrong Algorithm",
  "Complexity / TLE",
  "Memory Usage",
  "Missing Edge Case",
  "Incorrect Data Structure",
  "Implementation Error",
  "Other",
];

const REQUIRED_FIELDS = [
  "rootCause",
  "failureCategory",
  "concept",
  "evidence",
  "preventionRule",
  "suggestedFollowUp",
];

// Guardrails so we never send a runaway payload to the model or blow past
// its context window.
const MAX_SOURCE_CODE_CHARS = 20000;
const MAX_DESCRIPTION_CHARS = 6000;

export class GroqServiceError extends Error {
  constructor(message, { status = 500, code = "GROQ_ERROR" } = {}) {
    super(message);
    this.name = "GroqServiceError";
    this.status = status;
    this.code = code;
  }
}

function buildSystemPrompt() {
  return `You are a Data Structures & Algorithms mentor performing a "failure post-mortem" on a student's failed LeetCode submission.

Your ONLY job is to diagnose WHY their specific code failed — you are a debugging teacher, not a solution generator.

Strict rules:
- Do NOT write or reveal a corrected/working solution, and do NOT include full corrected code in any field.
- Do NOT rewrite the user's algorithm for them. You may reference small snippets of their code as evidence, but never output a fixed version.
- Base your diagnosis on concrete evidence from the user's actual source code, the verdict, and (if given) the problem statement/constraints.
- failureCategory MUST be exactly one of: ${ALLOWED_FAILURE_CATEGORIES.join(", ")}.
- Respond with ONLY a single JSON object — no markdown, no code fences, no commentary outside the JSON.

Additionally, produce a concrete failing test case ("failingTestCase") that demonstrates the exact bug you diagnosed:
- It must be a specific input the user's code would actually mishandle because of the identified root cause — not a generic or unrelated example.
- "expectedOutput" MUST be derived by reasoning from the actual problem statement/requirements (and constraints, if given) — never guessed or invented without justification.
- "actualOutput" is what the user's code would actually produce (or how it would misbehave, e.g. wrong value, timeout, crash) for that same input, reasoned from tracing their code.
- "explanation" must tie the input directly to the root cause you identified.
- If you cannot confidently determine BOTH a valid input and a correctly-reasoned expected output (for example, the problem statement is unavailable and you cannot verify what the correct output should be), set "failingTestCase" to JSON null instead of guessing. Do not fabricate an expected output you are not confident in.

The JSON object must have exactly these keys:
{
  "rootCause": "A precise explanation of the underlying reason the code fails.",
  "failureCategory": "One of the allowed categories above.",
  "concept": "The core DSA concept the user needs to strengthen (e.g. 'Sliding Window boundary handling').",
  "evidence": "A specific reference to lines/behavior in the user's code that supports the diagnosis.",
  "preventionRule": "A short, memorable rule the user can apply next time to avoid this class of bug.",
  "suggestedFollowUp": "A concrete next action for the user (e.g. what to test, trace, or re-derive) that does NOT hand them the solution.",
  "failingTestCase": {
    "input": "The concrete input that triggers the bug.",
    "expectedOutput": "The correct output for that input, reasoned from the problem's actual requirements.",
    "actualOutput": "What the user's code actually produces/does for that input.",
    "explanation": "Why this input exposes the root cause."
  } OR JSON null if you are not confident
}`;
}

function buildUserPrompt({
  problemTitle,
  problemDescription,
  constraints,
  tags,
  difficulty,
  verdict,
  language,
  runtime,
  memory,
  sourceCode,
}) {
  const parts = [
    `Problem Title: ${problemTitle || "Unknown"}`,
    difficulty ? `Difficulty: ${difficulty}` : null,
    tags?.length ? `Tags: ${tags.join(", ")}` : null,
    problemDescription
      ? `Problem Description:\n${problemDescription}`
      : "Problem Description: Not available.",
    constraints ? `Constraints:\n${constraints}` : null,
    `Verdict: ${verdict}`,
    `Language: ${language || "Unknown"}`,
    runtime ? `Runtime: ${runtime}` : null,
    memory ? `Memory: ${memory}` : null,
    `\nUser's Source Code:\n\`\`\`${language || ""}\n${sourceCode}\n\`\`\``,
  ].filter(Boolean);

  return parts.join("\n");
}

function truncate(text, maxChars) {
  if (!text || text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n... [truncated for length]`;
}

function extractJson(rawContent) {
  // Models occasionally wrap JSON in markdown fences despite instructions.
  const fenceMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1] : rawContent;
  return JSON.parse(candidate.trim());
}

const FAILING_TEST_CASE_FIELDS = ["input", "expectedOutput", "actualOutput", "explanation"];

function validateAnalysis(parsed) {
  for (const field of REQUIRED_FIELDS) {
    if (typeof parsed[field] !== "string" || !parsed[field].trim()) {
      throw new GroqServiceError(
        `AI response is missing a valid "${field}" field.`,
        { status: 502, code: "MALFORMED_AI_RESPONSE" }
      );
    }
  }

  if (!ALLOWED_FAILURE_CATEGORIES.includes(parsed.failureCategory)) {
    throw new GroqServiceError(
      `AI response returned an unrecognized failure category: "${parsed.failureCategory}".`,
      { status: 502, code: "MALFORMED_AI_RESPONSE" }
    );
  }
}

// The AI is explicitly allowed to abstain (return null) when it can't confidently
// derive a correct expected output. A well-formed but partial object is treated
// as an abstention too, rather than failing the whole analysis over one field.
function sanitizeFailingTestCase(rawTestCase) {
  if (rawTestCase === null || rawTestCase === undefined) return null;

  if (typeof rawTestCase !== "object" || Array.isArray(rawTestCase)) {
    return null;
  }

  const isComplete = FAILING_TEST_CASE_FIELDS.every(
    (field) => typeof rawTestCase[field] === "string" && rawTestCase[field].trim()
  );
  if (!isComplete) return null;

  return {
    input: rawTestCase.input.trim(),
    expectedOutput: rawTestCase.expectedOutput.trim(),
    actualOutput: rawTestCase.actualOutput.trim(),
    explanation: rawTestCase.explanation.trim(),
  };
}

/**
 * Diagnoses why a submission failed. Server-only.
 *
 * @param {object} input
 * @param {string} input.problemTitle
 * @param {string} [input.problemDescription]
 * @param {string} [input.constraints]
 * @param {string[]} [input.tags]
 * @param {string} [input.difficulty]
 * @param {string} input.verdict
 * @param {string} input.language
 * @param {string} [input.runtime]
 * @param {string} [input.memory]
 * @param {string} input.sourceCode
 * @returns {Promise<{rootCause:string, failureCategory:string, concept:string, evidence:string, preventionRule:string, suggestedFollowUp:string, failingTestCase:({input:string,expectedOutput:string,actualOutput:string,explanation:string}|null), aiModel:string}>}
 */
export async function analyzeFailure(input) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqServiceError(
      "AI analysis is not configured on this server.",
      { status: 503, code: "MISSING_API_KEY" }
    );
  }

  const sourceCode = (input.sourceCode || "").trim();
  if (!sourceCode) {
    throw new GroqServiceError("Source code is required for analysis.", {
      status: 400,
      code: "EMPTY_SOURCE_CODE",
    });
  }

  const payload = {
    ...input,
    sourceCode: truncate(sourceCode, MAX_SOURCE_CODE_CHARS),
    problemDescription: truncate(input.problemDescription, MAX_DESCRIPTION_CHARS),
  };

  let response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(payload) },
        ],
      }),
    });
  } catch (err) {
    console.error("[GROQ_NETWORK_ERROR]", err.message);
    throw new GroqServiceError(
      "Could not reach the AI service. Please try again.",
      { status: 502, code: "NETWORK_ERROR" }
    );
  }

  if (response.status === 429) {
    throw new GroqServiceError(
      "The AI service is rate-limited right now. Please try again shortly.",
      { status: 429, code: "RATE_LIMITED" }
    );
  }

  if (!response.ok) {
    // Never log headers/body verbatim (could echo back request auth info);
    // just the status for diagnostics.
    console.error("[GROQ_API_ERROR] status:", response.status);
    throw new GroqServiceError(
      "The AI service failed to analyze this submission.",
      { status: 502, code: "AI_SERVICE_ERROR" }
    );
  }

  let json;
  try {
    json = await response.json();
  } catch (err) {
    throw new GroqServiceError("The AI service returned an invalid response.", {
      status: 502,
      code: "MALFORMED_AI_RESPONSE",
    });
  }

  const rawContent = json?.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new GroqServiceError("The AI service returned an empty response.", {
      status: 502,
      code: "MALFORMED_AI_RESPONSE",
    });
  }

  let parsed;
  try {
    parsed = extractJson(rawContent);
  } catch (err) {
    throw new GroqServiceError(
      "The AI response could not be parsed as structured data.",
      { status: 502, code: "MALFORMED_AI_RESPONSE" }
    );
  }

  validateAnalysis(parsed);

  return {
    rootCause: parsed.rootCause.trim(),
    failureCategory: parsed.failureCategory,
    concept: parsed.concept.trim(),
    evidence: parsed.evidence.trim(),
    preventionRule: parsed.preventionRule.trim(),
    suggestedFollowUp: parsed.suggestedFollowUp.trim(),
    failingTestCase: sanitizeFailingTestCase(parsed.failingTestCase),
    aiModel: GROQ_MODEL,
  };
}

export { ALLOWED_FAILURE_CATEGORIES, MAX_SOURCE_CODE_CHARS };
