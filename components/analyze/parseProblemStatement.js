// LeetCode's public API doesn't expose examples/constraints as separate
// fields (see lib/leetcode.js fetchProblemDescription) — they arrive as one
// plain-text blob with their own literal "Example N:" / "Constraints:"
// headings already in it. This splits that real text on those real
// headings so the Problem panel can show three compact, collapsible
// sections instead of one long paragraph. Never invents content — anything
// that can't be confidently split just stays under Description.
export function parseProblemStatement(text) {
  if (!text) return { description: null, examples: [], constraints: null };

  const firstExampleIdx = text.search(/Example\s*1\s*:/i);
  const constraintsIdx = text.search(/Constraints\s*:/i);

  if (firstExampleIdx === -1 && constraintsIdx === -1) {
    return { description: text, examples: [], constraints: null };
  }

  const descriptionEnd = firstExampleIdx !== -1 ? firstExampleIdx : constraintsIdx;
  const description = text.slice(0, descriptionEnd).trim() || null;

  let examples = [];
  if (firstExampleIdx !== -1) {
    const examplesEnd = constraintsIdx !== -1 && constraintsIdx > firstExampleIdx ? constraintsIdx : text.length;
    const examplesBlock = text.slice(firstExampleIdx, examplesEnd).trim();
    const matches = [...examplesBlock.matchAll(/Example\s*\d+\s*:/gi)];
    examples = matches.map((m, i) => {
      const start = m.index;
      const end = i + 1 < matches.length ? matches[i + 1].index : examplesBlock.length;
      return examplesBlock.slice(start, end).trim();
    });
  }

  const constraints = constraintsIdx !== -1 ? text.slice(constraintsIdx).trim() : null;

  return { description, examples, constraints };
}
