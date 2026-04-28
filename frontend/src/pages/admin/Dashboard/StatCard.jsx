import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

/**
 * StatCard — Reusable metric summary card
 *
 * Props:
 *  head        {string}          Card label          e.g. "Total Surveys"
 *  icon        {Component|Node}  MUI icon component OR rendered element
 *  number      {string|number}   Primary metric      e.g. "1,247"
 *  subheading  {string}          Supporting label    e.g. "324 this month"
 *  chip        {{ label, type }} type: "success" | "warning" | "info" | "urgent"
 *  color       {string}          "blue" | "green" | "amber" | "red"
 *
 * ⚠️  Make sure tailwind.config.js content array covers this file's path
 *     so Tailwind's JIT doesn't purge these classes in production.
 */

const COLOR_MAP = {
  blue:  { iconBg: "bg-blue-600",   number: "text-blue-600"   },
  green: { iconBg: "bg-emerald-500", number: "text-emerald-500" },
  amber: { iconBg: "bg-[#F59E0B]",  number: "text-[#F59E0B]"  },
  red:   { iconBg: "bg-red-500",    number: "text-red-500"    },
};

const CHIP_STYLES = {
  success: { wrapper: "bg-emerald-100 text-emerald-800", dot: null },
  warning: { wrapper: "bg-amber-100 text-amber-800",     dot: null },
  info:    { wrapper: "bg-blue-100 text-blue-800",       dot: null },
  urgent:  { wrapper: "bg-amber-100 text-amber-800",     dot: "bg-amber-400" },
};

export default function StatCard({
  head = "Metric",
  icon,
  number = "0",
  subheading = "",
  chip = null,
  color = "blue",
}) {
  const palette   = COLOR_MAP[color] ?? COLOR_MAP.blue;
  const chipStyle = chip ? (CHIP_STYLES[chip.type] ?? CHIP_STYLES.info) : null;

  // Accepts both a component reference (MyIcon) and a rendered element (<MyIcon />)
  const renderedIcon = React.isValidElement(icon)
    ? icon
    : icon
    ? React.createElement(icon, { className: "text-white", style: { fontSize: 26 } })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-default flex-1">

      {/* ── Top row: icon badge + chip ── */}
      <div className="flex items-start justify-between mb-5">

        {/* Icon badge */}
        <div className={`w-13 h-13 rounded-xl flex items-center justify-center shrink-0 ${palette.iconBg}`}
          style={{ width: 52, height: 52 }}>
          {renderedIcon}
        </div>

        {/* Chip */}
        {chip && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${chipStyle.wrapper}`}>
            {chipStyle.dot && (
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${chipStyle.dot}`} />
            )}
            {chip.label}
          </span>
        )}
      </div>

      {/* ── Head ── */}
      <p className="text-gray-500 text-sm font-semibold tracking-wide mb-1.5">
        {head}
      </p>

      {/* ── Number ── */}
      <p className={`text-4xl font-bold leading-tight mb-1.5 ${palette.number}`}>
        {number}
      </p>

      {/* ── Subheading ── */}
      {subheading && (
        <p className="text-gray-400 text-xs">
          {subheading}
        </p>
      )}
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────
   Demo — delete this section before shipping to production
───────────────────────────────────────────────────────────── */
import AssignmentIcon   from "@mui/icons-material/Assignment";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import GroupsIcon       from "@mui/icons-material/Groups";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export function StatCardDemo() {
  const cards = [
    {
      head: "Total Surveys",
      icon: AssignmentIcon,
      number: "1,247",
      subheading: "324 this month",
      chip: { label: "+18%", type: "success" },
      color: "blue",
    },
    {
      head: "Active Tasks",
      icon: ContentPasteIcon,
      number: "89",
      subheading: "23 urgent tasks",
      chip: { label: "+12%", type: "success" },
      color: "green",
    },
    {
      head: "Volunteers",
      icon: GroupsIcon,
      number: "456",
      subheading: "142 active today",
      chip: { label: "+8%", type: "success" },
      color: "amber",
    },
    {
      head: "Urgent Needs",
      icon: WarningAmberIcon,
      number: "23",
      subheading: "Requires immediate action",
      chip: { label: "Urgent", type: "urgent" },
      color: "red",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 p-8 bg-gray-50 min-h-screen">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
}