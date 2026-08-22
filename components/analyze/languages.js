// Single source of truth for the four languages the Analyze editor
// supports. `id` is what's sent to the backend and used as Monaco's
// language id; `label` is the exact user-facing capitalization required.
export const LANGUAGES = [
  { id: "java", label: "Java" },
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
  { id: "javascript", label: "JavaScript" },
];

const LANGUAGE_BY_ID = new Map(LANGUAGES.map((l) => [l.id, l]));

// Client-only UI convenience — inserted into the editor when the user picks
// a language and the editor is still empty. Not a backend feature (this
// project has no language-specific template storage), so it's kept as an
// isolated, swappable map rather than invented server logic.
const STARTER_TEMPLATES = {
  java: 'class Solution {\n    public void solve() {\n        \n    }\n}\n',
  python: 'class Solution:\n    def solve(self):\n        pass\n',
  cpp: 'class Solution {\npublic:\n    void solve() {\n        \n    }\n};\n',
  javascript: '/**\n * @return {void}\n */\nvar solve = function() {\n  \n};\n',
};

export function labelForLanguage(id) {
  return LANGUAGE_BY_ID.get(id)?.label || id;
}

export function starterTemplateFor(id) {
  return STARTER_TEMPLATES[id] || "";
}

// Best-effort mapping from whatever LeetCode's sync stored as
// submission.language (e.g. "python3", "cpp", "javascript", "java") onto
// one of the four supported editor languages. Falls back to "javascript"
// for anything unrecognized, since the editor must always have a valid
// selection.
export function normalizeLanguageId(raw) {
  const value = (raw || "").toLowerCase();
  if (value.includes("java") && !value.includes("script")) return "java";
  if (value.includes("python")) return "python";
  if (value.includes("c++") || value === "cpp" || value.includes("cpp")) return "cpp";
  if (value.includes("javascript") || value === "js") return "javascript";
  return "javascript";
}
