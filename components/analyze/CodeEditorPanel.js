"use client";

import dynamic from "next/dynamic";
import { DARK_CARD, DARK_BTN_PRIMARY } from "@/lib/theme";
import LanguageSelector from "./LanguageSelector";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 w-full items-center justify-center text-xs text-neutral-600 lg:h-[30rem]">
      Loading editor…
    </div>
  ),
});

// Recolors the editor's chrome (background/gutter/line-highlight/selection)
// to match AlgoLens's near-black surface, and layers a tasteful, curated
// token palette on top of Monaco's own built-in tokenization (Monarch
// grammars per language) — the `rules` below only assign colors to
// token *categories* Monaco already identifies (keyword, string, comment,
// ...); nothing about *what* gets tokenized is reimplemented, per AGENTS.md
// ("do not manually implement syntax coloring; use Monaco's built-in
// language support"). Token names use Monaco's prefix matching (e.g. a
// "keyword" rule also matches "keyword.java", "keyword.python", ...), so
// one palette covers all four supported languages.
function beforeMount(monaco) {
  monaco.editor.defineTheme("algolens-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6b7280", fontStyle: "italic" },
      { token: "keyword", foreground: "c4b5fd" },
      { token: "string", foreground: "6ee7b7" },
      { token: "number", foreground: "fbbf24" },
      { token: "type", foreground: "7dd3fc" },
      { token: "type.identifier", foreground: "7dd3fc" },
      { token: "identifier", foreground: "e4e4e7" },
      { token: "delimiter", foreground: "9ca3af" },
      { token: "operator", foreground: "9ca3af" },
      { token: "function", foreground: "93c5fd" },
      { token: "tag", foreground: "818cf8" },
      { token: "annotation", foreground: "a5b4fc" },
    ],
    colors: {
      "editor.background": "#05060a",
      "editor.lineHighlightBackground": "#ffffff0a",
      "editor.selectionBackground": "#6366f14d",
      "editorLineNumber.foreground": "#52525b",
      "editorLineNumber.activeForeground": "#a5b4fc",
      "editorGutter.background": "#05060a",
      "editorCursor.foreground": "#818cf8",
      "editorWhitespace.foreground": "#27272a",
      "editorIndentGuide.background": "#ffffff0f",
      "editorIndentGuide.activeBackground": "#ffffff1f",
      "scrollbarSlider.background": "#ffffff14",
      "scrollbarSlider.hoverBackground": "#ffffff22",
    },
  });
}

const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
  minimap: { enabled: false },
  lineNumbers: "on",
  renderLineHighlight: "all",
  matchBrackets: "always",
  autoClosingBrackets: "languageDefined",
  autoIndent: "full",
  folding: true,
  tabSize: 2,
  wordWrap: "on",
  scrollBeyondLastLine: false,
  automaticLayout: true,
  quickSuggestions: true,
  suggestOnTriggerCharacters: true,
  padding: { top: 12 },
  bracketPairColorization: { enabled: true },
};

// CENTER panel — the real Monaco Editor (@monaco-editor/react), not a
// textarea. Language switching updates Monaco's syntax highlighting
// immediately via the `language` prop; the parent (AnalyzeWorkspace) is
// responsible for sending that same language along with the analyze request.
export default function CodeEditorPanel({
  language,
  onLanguageChange,
  sourceCode,
  onChange,
  onAnalyze,
  isAnalyzing,
  canAnalyze,
  isAccepted,
}) {
  return (
    <div className={`${DARK_CARD} flex flex-col`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-2 text-xs text-neutral-500">Your solution</span>
        </div>
        <LanguageSelector value={language} onChange={onLanguageChange} />
      </div>

      <div className="relative h-80 lg:h-[30rem]">
        {!sourceCode && (
          <div className="pointer-events-none absolute left-16 top-3 z-10 text-[13px] leading-relaxed text-neutral-600">
            <p>Paste or edit your submitted code here…</p>
            <p className="mt-0.5 text-xs text-neutral-700">Ctrl + V to paste</p>
          </div>
        )}
        <Editor
          height="100%"
          language={language}
          value={sourceCode}
          onChange={(value) => onChange(value || "")}
          beforeMount={beforeMount}
          theme="algolens-dark"
          options={EDITOR_OPTIONS}
        />
      </div>

      <div className="flex items-center gap-3 border-t border-white/10 p-4">
        <button
          type="button"
          disabled
          title="Code execution isn't available yet"
          className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-neutral-500 opacity-60 cursor-not-allowed"
        >
          Run Code
        </button>

        {canAnalyze ? (
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || !sourceCode.trim()}
            className={`flex-1 shadow-md shadow-indigo-950/30 hover:shadow-indigo-500/20 ${DARK_BTN_PRIMARY}`}
          >
            {isAnalyzing ? "Analyzing…" : "Analyze Solution →"}
          </button>
        ) : (
          <p className="flex-1 text-center text-xs text-neutral-500">
            {isAccepted
              ? "This submission passed — see what it demonstrates on the right."
              : "AlgoLens analyzes Wrong Answer, Time Limit Exceeded, and Memory Limit Exceeded submissions."}
          </p>
        )}
      </div>
    </div>
  );
}
