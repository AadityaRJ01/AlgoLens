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

// Shared low-level Groq caller used by every AI feature in this service
// (failure post-mortem, concept extraction, micro-proof evaluation) so we
// only have one place that owns the API key, endpoint, and error handling.
async function callGroqJSON({ systemPrompt, userPrompt, maxTokens = 1200, temperature = 0.2 }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqServiceError("AI analysis is not configured on this server.", {
      status: 503,
      code: "MISSING_API_KEY",
    });
  }

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
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
  } catch (err) {
    console.error("[GROQ_NETWORK_ERROR]", err.message);
    throw new GroqServiceError("Could not reach the AI service. Please try again.", {
      status: 502,
      code: "NETWORK_ERROR",
    });
  }

  if (response.status === 429) {
    throw new GroqServiceError("The AI service is rate-limited right now. Please try again shortly.", {
      status: 429,
      code: "RATE_LIMITED",
    });
  }

  if (!response.ok) {
    // Never log headers/body verbatim (could echo back request auth info);
    // just the status for diagnostics.
    console.error("[GROQ_API_ERROR] status:", response.status);
    throw new GroqServiceError("The AI service failed to process this request.", {
      status: 502,
      code: "AI_SERVICE_ERROR",
    });
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

  try {
    return extractJson(rawContent);
  } catch (err) {
    throw new GroqServiceError("The AI response could not be parsed as structured data.", {
      status: 502,
      code: "MALFORMED_AI_RESPONSE",
    });
  }
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

  const parsed = await callGroqJSON({
    systemPrompt: buildSystemPrompt(),
    userPrompt: buildUserPrompt(payload),
    maxTokens: 2000,
    temperature: 0.2,
  });

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

// ==========================================================================
// Phase 5: Concept Extraction + Active-Recall Micro-Proofs
// ==========================================================================

const UNDERSTANDING_LEVELS = ["strong", "partial", "weak"];

function buildConceptSystemPrompt() {
  return `You are a Data Structures & Algorithms mentor. A student has an ACCEPTED (working) LeetCode solution. Your job is to extract the CORE algorithmic concept behind their solution, and write one short active-recall question to test whether they truly understand it — not whether they can restate the LeetCode tag.

Strict rules:
- Do NOT just repeat the problem's topic tag (e.g. "Dynamic Programming", "Monotonic Stack", "Two Pointers") as the concept. Identify the specific pattern, invariant, or insight that makes the solution work.
  - Bad: "Dynamic Programming"
  - Good: "Defining a DP state that captures the minimum information needed to make future decisions"
  - Bad: "Monotonic Stack"
  - Good: "Maintaining a stack with a monotonic invariant so elements can be eliminated once a greater/smaller candidate is found"
- Avoid vague concepts like "Arrays", "Programming", "Problem Solving", "Coding".
- The micro-proof question must be answerable by a prepared student in about 30-60 seconds. It must NOT ask the student to re-code or re-derive the full solution.
- The question must test UNDERSTANDING (why the approach works, what an invariant/state means, why a precondition like sorting is needed) — not memorization of syntax or steps.
- "expectedPoints" is a list of 2-5 short reasoning points a strong answer would hit. These are grading criteria for another AI to check against — they may be a bit more detailed than the question itself, but must NOT contain a full corrected solution or full code.
- Respond with ONLY a single JSON object — no markdown, no code fences, no commentary outside the JSON.

The JSON object must have exactly these keys:
{
  "concept": {
    "name": "A short, specific concept name (a few words, not a generic tag).",
    "coreIdea": "1-3 sentences explaining the core idea/pattern in this solution.",
    "invariant": "The key invariant, principle, or precondition that makes the approach correct."
  },
  "microProof": {
    "question": "One short active-recall question, answerable in ~30-60 seconds, testing understanding of the concept above.",
    "expectedPoints": ["short reasoning point 1", "short reasoning point 2", "..."]
  }
}`;
}

function buildConceptUserPrompt({ problemTitle, problemDescription, tags, difficulty, sourceCode, language }) {
  const parts = [
    `Problem Title: ${problemTitle || "Unknown"}`,
    difficulty ? `Difficulty: ${difficulty}` : null,
    tags?.length ? `Tags: ${tags.join(", ")}` : null,
    problemDescription
      ? `Problem Description:\n${problemDescription}`
      : "Problem Description: Not available.",
    sourceCode
      ? `The user's ACCEPTED solution (language: ${language || "unknown"}):\n\`\`\`${language || ""}\n${sourceCode}\n\`\`\``
      : "The user's accepted source code is not available — base the concept on the problem's title, difficulty, tags, and description only.",
  ].filter(Boolean);

  return parts.join("\n");
}

function validateConceptExtraction(parsed) {
  const concept = parsed?.concept;
  const microProof = parsed?.microProof;

  if (!concept || typeof concept !== "object") {
    throw new GroqServiceError('AI response is missing a valid "concept" object.', {
      status: 502,
      code: "MALFORMED_AI_RESPONSE",
    });
  }
  for (const field of ["name", "coreIdea", "invariant"]) {
    if (typeof concept[field] !== "string" || !concept[field].trim()) {
      throw new GroqServiceError(`AI response is missing a valid "concept.${field}" field.`, {
        status: 502,
        code: "MALFORMED_AI_RESPONSE",
      });
    }
  }

  if (!microProof || typeof microProof !== "object") {
    throw new GroqServiceError('AI response is missing a valid "microProof" object.', {
      status: 502,
      code: "MALFORMED_AI_RESPONSE",
    });
  }
  if (typeof microProof.question !== "string" || !microProof.question.trim()) {
    throw new GroqServiceError('AI response is missing a valid "microProof.question" field.', {
      status: 502,
      code: "MALFORMED_AI_RESPONSE",
    });
  }
  if (
    !Array.isArray(microProof.expectedPoints) ||
    microProof.expectedPoints.length === 0 ||
    !microProof.expectedPoints.every((p) => typeof p === "string" && p.trim())
  ) {
    throw new GroqServiceError('AI response is missing valid "microProof.expectedPoints".', {
      status: 502,
      code: "MALFORMED_AI_RESPONSE",
    });
  }
}

/**
 * Extracts the core algorithmic concept behind an accepted submission and
 * generates one active-recall Micro-Proof question for it. Server-only.
 *
 * @param {object} input
 * @param {string} input.problemTitle
 * @param {string} [input.problemDescription]
 * @param {string[]} [input.tags]
 * @param {string} [input.difficulty]
 * @param {string} [input.sourceCode] - optional; extraction still works without it
 * @param {string} [input.language]
 * @returns {Promise<{concept:{name:string,coreIdea:string,invariant:string}, microProof:{question:string,expectedPoints:string[]}, aiModel:string}>}
 */
export async function extractConceptAndMicroProof(input) {
  const payload = {
    ...input,
    sourceCode: input.sourceCode ? truncate(input.sourceCode.trim(), MAX_SOURCE_CODE_CHARS) : null,
    problemDescription: truncate(input.problemDescription, MAX_DESCRIPTION_CHARS),
  };

  const parsed = await callGroqJSON({
    systemPrompt: buildConceptSystemPrompt(),
    userPrompt: buildConceptUserPrompt(payload),
    maxTokens: 1200,
    temperature: 0.3,
  });

  validateConceptExtraction(parsed);

  return {
    concept: {
      name: parsed.concept.name.trim(),
      coreIdea: parsed.concept.coreIdea.trim(),
      invariant: parsed.concept.invariant.trim(),
    },
    microProof: {
      question: parsed.microProof.question.trim(),
      expectedPoints: parsed.microProof.expectedPoints.map((p) => p.trim()),
    },
    aiModel: GROQ_MODEL,
  };
}

function buildEvaluationSystemPrompt() {
  return `You are a Data Structures & Algorithms mentor evaluating a student's answer to a short active-recall "Micro-Proof" question about a concept from a problem they already solved.

Strict rules:
- Judge ONLY conceptual understanding. Do NOT judge grammar, spelling, or writing style.
- A short but conceptually correct answer must receive a good score. A long answer containing incorrect or irrelevant reasoning must receive a low score.
- Compare the user's answer against the expected reasoning points, but do not require the exact wording — accept equivalent reasoning.
- Do NOT reveal a complete solution or full corrected code in your feedback. Keep feedback focused on the concept, not on rewriting their approach.
- Respond with ONLY a single JSON object — no markdown, no code fences, no commentary outside the JSON.

The JSON object must have exactly these keys:
{
  "score": <integer 0-10>,
  "understanding": "strong" | "partial" | "weak",
  "whatWasCorrect": "What the user's answer got right, or 'Nothing substantive' style note if applicable.",
  "missingPoints": ["expected reasoning point the answer missed", "..."],
  "feedback": "1-3 sentences of constructive feedback on their conceptual understanding."
}
"missingPoints" may be an empty array if the answer covered everything expected.`;
}

function buildEvaluationUserPrompt({
  problemTitle,
  difficulty,
  tags,
  conceptName,
  coreIdea,
  invariant,
  question,
  expectedPoints,
  userAnswer,
}) {
  const parts = [
    `Problem Title: ${problemTitle || "Unknown"}`,
    difficulty ? `Difficulty: ${difficulty}` : null,
    tags?.length ? `Tags: ${tags.join(", ")}` : null,
    `Concept: ${conceptName}`,
    `Core Idea: ${coreIdea}`,
    `Invariant/Principle: ${invariant}`,
    `Micro-Proof Question: ${question}`,
    `Expected Reasoning Points:\n- ${expectedPoints.join("\n- ")}`,
    `\nUser's Answer:\n${userAnswer}`,
  ].filter(Boolean);

  return parts.join("\n");
}

function validateEvaluation(parsed) {
  if (typeof parsed.score !== "number" || !Number.isFinite(parsed.score)) {
    throw new GroqServiceError('AI response is missing a valid "score" field.', {
      status: 502,
      code: "MALFORMED_AI_RESPONSE",
    });
  }
  if (!UNDERSTANDING_LEVELS.includes(parsed.understanding)) {
    throw new GroqServiceError(`AI response returned an unrecognized understanding level: "${parsed.understanding}".`, {
      status: 502,
      code: "MALFORMED_AI_RESPONSE",
    });
  }
  for (const field of ["whatWasCorrect", "feedback"]) {
    if (typeof parsed[field] !== "string" || !parsed[field].trim()) {
      throw new GroqServiceError(`AI response is missing a valid "${field}" field.`, {
        status: 502,
        code: "MALFORMED_AI_RESPONSE",
      });
    }
  }
  if (
    !Array.isArray(parsed.missingPoints) ||
    !parsed.missingPoints.every((p) => typeof p === "string")
  ) {
    throw new GroqServiceError('AI response is missing a valid "missingPoints" array.', {
      status: 502,
      code: "MALFORMED_AI_RESPONSE",
    });
  }
}

/**
 * Evaluates a user's answer to a Micro-Proof question for conceptual understanding. Server-only.
 *
 * @param {object} input
 * @param {string} input.problemTitle
 * @param {string} [input.difficulty]
 * @param {string[]} [input.tags]
 * @param {string} input.conceptName
 * @param {string} input.coreIdea
 * @param {string} input.invariant
 * @param {string} input.question
 * @param {string[]} input.expectedPoints
 * @param {string} input.userAnswer
 * @returns {Promise<{score:number, understanding:string, whatWasCorrect:string, missingPoints:string[], feedback:string, aiModel:string}>}
 */
export async function evaluateMicroProofAnswer(input) {
  const userAnswer = (input.userAnswer || "").trim();
  if (!userAnswer) {
    throw new GroqServiceError("An answer is required for evaluation.", {
      status: 400,
      code: "EMPTY_ANSWER",
    });
  }

  const parsed = await callGroqJSON({
    systemPrompt: buildEvaluationSystemPrompt(),
    userPrompt: buildEvaluationUserPrompt({ ...input, userAnswer }),
    maxTokens: 900,
    temperature: 0.2,
  });

  validateEvaluation(parsed);

  const score = Math.round(Math.min(10, Math.max(0, parsed.score)));

  return {
    score,
    understanding: parsed.understanding,
    whatWasCorrect: parsed.whatWasCorrect.trim(),
    missingPoints: parsed.missingPoints.map((p) => p.trim()).filter(Boolean),
    feedback: parsed.feedback.trim(),
    aiModel: GROQ_MODEL,
  };
}

export { ALLOWED_FAILURE_CATEGORIES, MAX_SOURCE_CODE_CHARS };
