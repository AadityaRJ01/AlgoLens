"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Real Phase 5 MicroProofAttempt score history for the concept the caller
// picked (see buildMasteryTrend in lib/dashboard.js) — one real data point
// per actual attempt, never interpolated or invented.
export default function MasteryTrendChart({ data, concept }) {
  return (
    <div className="h-64 w-full" role="img" aria-label={`Line chart of Micro-Proof score trend for ${concept}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="attempt"
            tick={{ fontSize: 11, fill: "#475569" }}
            label={{ value: "Attempt #", position: "insideBottom", offset: -4, fontSize: 11, fill: "#64748b" }}
          />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#475569" }} width={28} />
          <Tooltip
            formatter={(value) => [`${value}/10`, "Score"]}
            labelFormatter={(label) => `Attempt ${label}`}
            contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#e2e8f0" }}
          />
          <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
