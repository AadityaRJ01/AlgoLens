"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="flex h-40 items-center justify-center text-xs text-slate-600">Loading code view…</div>,
});

const LANGUAGE_MAP = {
  Java: "java",
  Python: "python",
  "C++": "cpp",
  C: "c",
  "C#": "csharp",
  JavaScript: "javascript",
  TypeScript: "typescript",
  Go: "go",
  Kotlin: "kotlin",
};

// Read-only, syntax-highlighted view of the user's pasted code — reuses
// @monaco-editor/react (already a project dependency, added for the
// Analyze page's editor) purely for display here; the underlying
// `currentCode` value is still owned by DoubtSolverWorkspace.js's existing
// form state.
export default function CodeView({ code, language }) {
  if (!code) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-white/10">
      <Editor
        height="12rem"
        language={LANGUAGE_MAP[language] || "plaintext"}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          domReadOnly: true,
          minimap: { enabled: false },
          fontSize: 12,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          folding: false,
          wordWrap: "on",
          padding: { top: 8 },
        }}
      />
    </div>
  );
}
