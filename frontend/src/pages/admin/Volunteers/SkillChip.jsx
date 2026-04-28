import React from "react";

/**
 * SkillChip — Outlined pill for a skill label
 * Props: label {string}
 */
export default function SkillChip({ label }) {
  return (
    <span className="text-xs font-medium text-gray-600 border border-gray-200 rounded-full px-3 py-1 bg-white whitespace-nowrap">
      {label}
    </span>
  );
}