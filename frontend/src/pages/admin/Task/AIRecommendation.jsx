import React from "react";
import { Button } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";

/**
 * AIRecommendation — AI-powered volunteer suggestion panel
 * Props:
 *  matchPercent  {number}   e.g. 95
 *  subtitle      {string}   "Based on skills and proximity"
 *  volunteerName {string}
 *  volunteerMeta {string}   "Expert in food distribution, 2km away"
 *  onAssign      {function}
 */
const AVATAR_COLORS = [
  "bg-emerald-500", "bg-blue-500", "bg-amber-500",
  "bg-purple-500",  "bg-rose-500", "bg-teal-500",
];

export default function AIRecommendation({
  matchPercent  = 95,
  subtitle      = "Based on skills and proximity",
  volunteerName = "Sneha Verma",
  volunteerMeta = "Expert in food distribution, 2km away",
  onAssign,
}) {
  const initial  = volunteerName?.charAt(0).toUpperCase();
  const bgColor  = AVATAR_COLORS[volunteerName.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3.5 flex items-center gap-4">
      {/* Left: icon + label */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Lightning icon */}
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <BoltIcon sx={{ fontSize: 18, color: "#fff" }} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-bold text-blue-700">AI Recommendation</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
              {matchPercent}% Match
            </span>
          </div>
          <p className="text-xs text-blue-400 mb-2">{subtitle}</p>

          {/* Volunteer avatar row */}
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
              {initial}
            </span>
            <div>
              <p className="text-sm font-semibold text-blue-700 leading-tight">{volunteerName}</p>
              <p className="text-xs text-blue-400">{volunteerMeta}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Now button */}
      <Button onClick={onAssign} variant="contained"
        sx={{
          borderRadius: "10px", backgroundColor: "#2563EB",
          textTransform: "none", fontWeight: 700, fontSize: "13px",
          px: "18px", py: "9px", whiteSpace: "nowrap", shrink: 0,
          boxShadow: "0 1px 3px rgba(37,99,235,0.3)",
          "&:hover": { backgroundColor: "#1d4ed8" },
        }}>
        Assign Now
      </Button>
    </div>
  );
}