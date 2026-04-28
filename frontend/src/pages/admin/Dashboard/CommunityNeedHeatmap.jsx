import React from "react";
import NeedBar from "./NeedBar";

/**
 * CommunityNeedsHeatmap
 *
 * Props:
 *  title       {string}    Card title
 *  subtitle    {string}    Card subtitle
 *  data        {Array}     [{ label, badge, percentage, color }]
 *  onAIInsight {function}  Callback for the AI Insight button
 */

const LEGEND = [
  { color: "#10B981", label: "Low" },
  { color: "#2563EB", label: "Medium" },
  { color: "#F59E0B", label: "High" },
  { color: "#fb2c36", label: "Critical" },
];

const DEFAULT_DATA = [
  { label: "North District",   badge: "High",     percentage: 85, color: "red"   },
  { label: "South District",   badge: "Medium",   percentage: 45, color: "blue"  },
  { label: "East District",    badge: "Critical", percentage: 92, color: "red"   },
  { label: "West District",    badge: "Low",      percentage: 38, color: "green" },
  { label: "Central District", badge: "High",     percentage: 67, color: "amber" },
  { label: "Suburban Area",    badge: "Medium",   percentage: 55, color: "blue"  },
];

export default function CommunityNeedsHeatmap({
  title = "Community Needs Heatmap",
  subtitle = "AI-powered analysis of urgent areas",
  data = DEFAULT_DATA,
  onAIInsight,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex-2">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 leading-snug">{title}</h2>
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>

        <button
          onClick={onAIInsight}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition-colors shrink-0 ml-4"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            <circle cx="12" cy="12" r="4"/>
          </svg>
          AI Insight
        </button>
      </div>

      {/* Bars */}
      <div className="flex flex-col gap-5">
        {data.map((item, i) => (
          <NeedBar key={i} {...item} animated />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <span className="text-xs font-medium text-gray-400">Low Need</span>
        <div className="flex items-center gap-2">
          {LEGEND.map(({ color, label }) => (
            <div key={label} className="relative group">
              <span
                className="block w-3.5 h-3.5 rounded-full cursor-default"
                style={{ backgroundColor: color }}
              />
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {label}
              </span>
            </div>
          ))}
        </div>
        <span className="text-xs font-medium text-gray-400">Critical Need</span>
      </div>
    </div>
  );
}