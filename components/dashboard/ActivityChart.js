"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DARK_CARD_PADDED } from "@/lib/theme";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-neutral-200">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// "Learning Activity" — section 10, deliberately the smallest/last section
// on the dashboard (see AGENTS: "AlgoLens should emphasize learning quality
// rather than simply problem quantity" / "do not make analytics the visual
// centerpiece"). `data` is real per-day submission counts from the last 7
// days (see buildWeeklyActivity in lib/dashboard.js).
export default function ActivityChart({ data }) {
  const hasActivity = data.some((d) => d.attempted > 0);

  return (
    <section className={`${DARK_CARD_PADDED} flex h-full flex-col`}>
      <h2 className="text-base font-semibold text-neutral-50">Learning Activity</h2>
      <p className="mt-0.5 text-sm text-neutral-500">Problems attempted vs. solved, last 7 days.</p>

      <div className="mt-4 h-40 w-full flex-1">
        {hasActivity ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="attempted" name="Attempted" fill="#4338ca" radius={[3, 3, 0, 0]} maxBarSize={18} />
              <Bar dataKey="solved" name="Solved" fill="#60a5fa" radius={[3, 3, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="flex h-full items-center text-sm text-neutral-500">
            No activity in the last 7 days yet.
          </p>
        )}
      </div>
    </section>
  );
}
