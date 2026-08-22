import { SearchIcon } from "@/components/icons";

// Plain GET form, no client JS — preserves the other active filters as
// hidden fields so searching never resets difficulty/topic/status.
export default function ProblemSearch({ current }) {
  return (
    <form action="/problems" className="flex items-center gap-2">
      <div className="relative">
        <SearchIcon width={15} height={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          name="q"
          defaultValue={current.q || ""}
          placeholder="Search problems…"
          className="w-56 rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400/50"
        />
      </div>
      {current.difficulty && <input type="hidden" name="difficulty" value={current.difficulty} />}
      {current.topic && <input type="hidden" name="topic" value={current.topic} />}
      {current.status && <input type="hidden" name="status" value={current.status} />}
      <button type="submit" className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5">
        Search
      </button>
    </form>
  );
}
