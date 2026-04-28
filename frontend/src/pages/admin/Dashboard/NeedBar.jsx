import React from "react";

/**
 * NeedBar — Reusable gradient progress bar
 *
 * Props:
 *  label      {string}   District / area name
 *  badge      {string}   "High" | "Medium" | "Low" | "Critical"
 *  percentage {number}   0–100
 *  color      {string}   "blue" | "green" | "amber" | "red"
 *  animated   {boolean}  Animate bar width on mount (default: true)
 *
 * NOTE: Gradient fills and glow box-shadows must stay as inline styles
 *       — Tailwind JIT cannot generate arbitrary gradient/shadow values.
 *       Everything else is Tailwind.
 */

const COLOR_CONFIG = {
  blue: {
    gradient: "linear-gradient(90deg,#2563EB 0%,#1d4ed8 60%,#1e40af 100%)",
    glow: "0 2px 10px rgba(37,99,235,0.28)",
    badge: "bg-blue-100 text-blue-700",
  },
  green: {
    gradient: "linear-gradient(90deg,#10B981 0%,#059669 60%,#047857 100%)",
    glow: "0 2px 10px rgba(16,185,129,0.28)",
    badge: "bg-emerald-100 text-emerald-700",
  },
  amber: {
    gradient: "linear-gradient(90deg,#F59E0B 0%,#d97706 60%,#b45309 100%)",
    glow: "0 2px 10px rgba(245,158,11,0.3)",
    badge: "bg-amber-100 text-amber-700",
  },
  red: {
    gradient: "linear-gradient(90deg,#fb2c36 0%,#e11d48 55%,#be123c 100%)",
    glow: "0 2px 12px rgba(251,44,54,0.32)",
    badge: "bg-red-100 text-red-600",
    dot: true,
  },
};

export default function NeedBar({
  label = "District",
  badge = "Medium",
  percentage = 50,
  color = "blue",
  animated = true,
}) {
  const config = COLOR_CONFIG[color] ?? COLOR_CONFIG.blue;
  const [width, setWidth] = React.useState(animated ? 0 : percentage);

  React.useEffect(() => {
    if (!animated) return;
    const t = setTimeout(() => setWidth(percentage), 120);
    return () => clearTimeout(t);
  }, [percentage, animated]);

  return (
    <div className="w-full">
      {/* Label row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{label}</span>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${config.badge}`}>
            {config.dot && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
            {badge}
          </span>
        </div>
        <span className="text-sm font-semibold text-gray-400">{percentage}%</span>
      </div>

      {/* Track */}
      <div className="relative w-full h-11 bg-gray-100 rounded-xl overflow-hidden">
        {/* Filled bar — gradient + glow must be inline */}
        <div
          className="absolute inset-y-0 left-0 rounded-xl"
          style={{
            width: `${width}%`,
            background: config.gradient,
            boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.1), ${config.glow}`,
            transition: animated ? "width 0.85s cubic-bezier(0.4,0,0.2,1)" : "none",
          }}
        />
        {/* Shine overlay */}
        <div
          className="absolute inset-y-0 left-0 rounded-xl overflow-hidden pointer-events-none"
          style={{
            width: `${width}%`,
            transition: animated ? "width 0.85s cubic-bezier(0.4,0,0.2,1)" : "none",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-1/2 rounded-t-xl"
            style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 100%)" }}
          />
        </div>
      </div>
    </div>
  );
}