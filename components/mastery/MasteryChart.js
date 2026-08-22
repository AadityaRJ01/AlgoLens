"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-neutral-200">{label}</p>
      <p className="text-indigo-300">{payload[0].value}%</p>
    </div>
  );
}

// "Mastery Progress" — real weekly-bucketed Micro-Proof score trend for this
// concept (see buildProgressChart in lib/masteryInsights.js), kept small
// and secondary. Shows an honest empty state instead of a chart when there
// isn't yet enough history to plot a real trend.
export default function MasteryChart({ data }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-400/90">Mastery Progress</p>
      {!data ? (
        <p className="mt-1.5 text-sm text-neutral-500">Not enough history yet to chart a trend.</p>
      ) : (
        <div className="mt-2 h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.15)" }} />
              <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2} dot={{ r: 3, fill: "#818cf8" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
