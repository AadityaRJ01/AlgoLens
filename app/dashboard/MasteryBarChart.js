"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { masteryStatusColor } from "@/lib/theme";

// Real Phase 6 ConceptMastery scores — no fabricated data. `data` is
// [{ concept, masteryScore, status }], already limited/sorted by the caller.
export default function MasteryBarChart({ data }) {
  return (
    <div className="h-64 w-full" role="img" aria-label="Bar chart of concept mastery percentages">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="concept"
            tick={{ fontSize: 11, fill: "#475569" }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#475569" }} width={36} />
          <Tooltip
            formatter={(value) => [`${value}%`, "Mastery"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#e2e8f0" }}
          />
          <Bar dataKey="masteryScore" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry) => (
              <Cell key={entry.concept} fill={masteryStatusColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
