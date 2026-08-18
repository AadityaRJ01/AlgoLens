// lib/constants.js

// The three failing verdicts Phase 4 ("Why Did I Fail?") covers.
export const FAILING_VERDICTS = [
  "Wrong Answer",
  "Time Limit Exceeded",
  "Memory Limit Exceeded",
];

// Hard ceiling on pasted source code accepted by the analyze endpoint,
// to avoid holding/forwarding unbounded input before the Groq service
// truncates it further for the actual prompt.
export const MAX_PASTE_CHARS = 200000;
