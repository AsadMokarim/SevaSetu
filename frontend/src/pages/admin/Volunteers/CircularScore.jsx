import React from "react";

/**
 * CircularScore — SVG ring showing a percentage score
 * Props: score {number} 0-100, size {number}, strokeWidth {number}
 */
export default function CircularScore({ score = 0, size = 72, strokeWidth = 6 }) {
  const r       = (size - strokeWidth) / 2;
  const circ    = 2 * Math.PI * r;
  const filled  = (score / 100) * circ;
  const center  = size / 2;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={center} cy={center} r={r}
          fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
        {/* Fill */}
        <circle cx={center} cy={center} r={r}
          fill="none" stroke="#10B981" strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round" />
      </svg>
      {/* Label */}
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-600">
        {Math.round(score)}%
      </span>
    </div>
  );
}