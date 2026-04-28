import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Dot,
} from "recharts";

/**
 * TaskCompletionChart — Monthly completed vs pending trend
 *
 * Props:
 *  title    {string}
 *  subtitle {string}
 *  data     {Array}  [{ month, completed, pending }]
 */

const DEFAULT_DATA = [
  { month: "Jan", completed: 65, pending: 32 },
  { month: "Feb", completed: 72, pending: 27 },
  { month: "Mar", completed: 67, pending: 30 },
  { month: "Apr", completed: 85, pending: 15 },
  { month: "May", completed: 78, pending: 22 },
  { month: "Jun", completed: 93, pending: 9  },
];

const COLORS = {
  completed: "#10B981",
  pending:   "#F59E0B",
};

/* ── Custom dot ───────────────────────────────────────────── */
function ActiveDot({ cx, cy, fill }) {
  return (
    <circle cx={cx} cy={cy} r={5} fill={fill} stroke="#fff" strokeWidth={2} />
  );
}

/* ── Custom tooltip ───────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg min-w-[140px]">
      <p className="text-xs font-semibold text-gray-400 mb-2">{label}</p>
      {payload.map(({ name, value, color }) => (
        <div key={name} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-500 capitalize">{name}</span>
          </div>
          <span className="text-sm font-bold" style={{ color }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Custom legend ────────────────────────────────────────── */
function CustomLegend() {
  return (
    <div className="flex items-center justify-center gap-6 mt-2">
      {Object.entries(COLORS).map(([key, color]) => (
        <div key={key} className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            <div className="h-0.5 w-4" style={{ backgroundColor: color }} />
            <div className="w-2 h-2 rounded-full border-2" style={{ borderColor: color, backgroundColor: "#fff" }} />
            <div className="h-0.5 w-4" style={{ backgroundColor: color }} />
          </div>
          <span className="text-xs font-semibold capitalize" style={{ color }}>{key}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function TaskCompletionChart({
  title = "Task Completion Rate",
  subtitle = "Monthly trend of completed vs pending tasks",
  data = DEFAULT_DATA,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex-1">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 leading-snug">{title}</h2>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#E5E7EB"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 13, fill: "#6B7280", fontWeight: 500 }}
            dy={8}
          />
          <YAxis
            tickCount={6}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            dx={-4}
          />
          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="completed"
            stroke={COLORS.completed}
            strokeWidth={2.5}
            dot={{ r: 4, fill: COLORS.completed, stroke: "#fff", strokeWidth: 2 }}
            activeDot={<ActiveDot fill={COLORS.completed} />}
          />
          <Line
            type="monotone"
            dataKey="pending"
            stroke={COLORS.pending}
            strokeWidth={2.5}
            dot={{ r: 4, fill: COLORS.pending, stroke: "#fff", strokeWidth: 2 }}
            activeDot={<ActiveDot fill={COLORS.pending} />}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <CustomLegend />
    </div>
  );
}