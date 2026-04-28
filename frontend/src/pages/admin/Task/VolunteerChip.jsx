import React from "react";

/**
 * VolunteerChip — Avatar initial + name pill
 * Props:
 *  name  {string}
 *  color {string} tailwind bg class e.g. "bg-emerald-500"
 */
const AVATAR_COLORS = [
  "bg-emerald-500", "bg-blue-500", "bg-amber-500",
  "bg-purple-500",  "bg-rose-500", "bg-teal-500",
];

function getColor(name, override) {
  if (override) return override;
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

export default function VolunteerChip({ name, color, onDelete }) {
  const initial  = name?.charAt(0).toUpperCase() ?? "?";
  const bgColor  = getColor(name, color);

  return (
    <div className="inline-flex items-center gap-2 border border-gray-200 rounded-full pl-1 pr-1.5 py-1 bg-white group transition-all hover:border-red-200 hover:bg-red-50">
      <span className={`w-7 h-7 rounded-full ${bgColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
        {initial}
      </span>
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{name}</span>
      {onDelete && (
        <IconButton 
            size="small" 
            onClick={onDelete}
            sx={{ 
                p: 0.25, 
                color: '#9CA3AF',
                "&:hover": { color: '#ef4444' } 
            }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      )}
    </div>
  );
}