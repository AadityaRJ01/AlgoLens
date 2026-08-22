"use client";

import { useEffect, useRef, useState } from "react";
import { LANGUAGES, labelForLanguage } from "./languages";

// Compact custom dropdown ("Java ▾") — no select/dropdown primitive exists
// yet in components/ui, and a native <select> can't be styled to match
// AlgoLens's dark hover treatment, so this is a small self-contained
// implementation rather than a new dependency.
export default function LanguageSelector({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-1 rounded-md border border-indigo-400/20 bg-indigo-500/[0.06] px-2.5 py-1 text-xs font-medium text-indigo-200 outline-none transition-colors hover:border-indigo-400/40 hover:bg-indigo-500/10 focus-visible:border-indigo-400/50 focus-visible:ring-1 focus-visible:ring-indigo-400/50"
      >
        {labelForLanguage(value)}
        <span aria-hidden="true" className="text-[10px] text-indigo-400/70">▾</span>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-md border border-white/10 bg-neutral-900 py-1 shadow-xl shadow-black/40"
        >
          {LANGUAGES.map((lang) => (
            <li key={lang.id}>
              <button
                type="button"
                role="option"
                aria-selected={value === lang.id}
                onClick={() => {
                  onChange(lang.id);
                  setIsOpen(false);
                }}
                className={`block w-full px-3 py-1.5 text-left text-xs transition-colors ${
                  value === lang.id ? "bg-indigo-500/10 text-indigo-200" : "text-neutral-300 hover:bg-white/5"
                }`}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
