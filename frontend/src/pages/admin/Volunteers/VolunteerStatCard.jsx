import React from "react";

/**
 * VolunteerStatCard — Minimal stat card (icon right, no chip)
 * Props: head, icon, number, color
 */
export default function VolunteerStatCard({ head = "Metric", icon, number = "0", color = "blue" }) {
  const COLOR = {
    blue:   "text-blue-500",
    green:  "text-emerald-500",
    amber:  "text-amber-400",
    purple: "text-purple-500",
  };
  const renderedIcon = React.isValidElement(icon)
    ? icon
    : icon ? React.createElement(icon, { style: { fontSize: 28 } }) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between flex-1 min-w-[160px]">
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-gray-500">{head}</p>
        <span className={COLOR[color] ?? COLOR.blue}>{renderedIcon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-3">{number}</p>
    </div>
  );
}