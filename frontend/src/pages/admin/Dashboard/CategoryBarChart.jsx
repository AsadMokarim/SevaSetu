import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer,
} from "recharts";

/**
 * CategoryBarChart — Community Needs by Category
 *
 * Props:
 *  title    {string}  Card title
 *  subtitle {string}  Card subtitle
 *  data     {Array}   [{ category, value, color }]
 *
 * NOTE: Recharts tick/cell props only accept inline styles (SVG limitation).
 *       Everything else — card, header, tooltip — is pure Tailwind.
 */

const DEFAULT_DATA = [
  { category: "Food",       value: 255, color: "#2563EB" },
  { category: "Healthcare", value: 190, color: "#10B981" },
  { category: "Education",  value: 145, color: "#F59E0B" },
  { category: "Shelter",    value: 90,  color: "#8B5CF6" },
  { category: "Employment", value: 65,  color: "#EC4899" },
];

/* ── Rounded-top bar shape ─────────────────────────────────── */
function RoundedBar({ x, y, width, height, fill }) {
  const r = 8;
  if (!height || height <= 0) return null;
  return (
    <path
      d={`M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y}
          L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r}
          L${x + width},${y + height} Z`}
      fill={fill}
    />
  );
}

/* ── Custom tooltip — fully Tailwind ──────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const { value, color } = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg min-w-[130px]">
      <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold leading-tight" style={{ color }}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">identified needs</p>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function CategoryBarChart({
  title = "Community Needs by Category",
  subtitle = "Distribution of identified needs across sectors",
  data = DEFAULT_DATA,
}) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const yMax = Math.ceil(maxVal / 65) * 65;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex-1">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 leading-snug">{title}</h2>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>

      {/* Chart — Recharts SVG internals can't use Tailwind */}
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            vertical={false}
            stroke="#E5E7EB"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 13, fill: "#6B7280", fontWeight: 500 }}
            dy={8}
          />
          <YAxis
            domain={[0, yMax]}
            tickCount={6}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            dx={-4}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.04)", radius: 8 }}
          />
          <Bar dataKey="value" shape={<RoundedBar />} maxBarSize={72}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}