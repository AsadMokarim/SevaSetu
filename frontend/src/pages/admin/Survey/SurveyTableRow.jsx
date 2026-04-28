import React from "react";
import { Tooltip, IconButton } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

/**
 * SurveyTableRow — A single row in the survey table
 *
 * Props:
 *  row        {object}   Survey data object (see shape below)
 *  onView     {function} (row) => void
 *  onEdit     {function} (row) => void
 *  onDelete   {function} (row) => void
 *
 * Row shape:
 *  { id, title, category, location, urgency, date, status }
 *
 * urgency : "Critical" | "High" | "Medium" | "Low"
 * status  : "Active" | "Completed" | "Pending" | "Inactive"
 */

/* ── Badge configs ──────────────────────────────────────── */
const URGENCY_STYLES = {
  Critical: { wrapper: "bg-red-100 text-red-500",    dot: "bg-red-500",    label: "Critical" },
  High:     { wrapper: "bg-amber-100 text-amber-500", dot: "bg-amber-400",  label: "High"     },
  Medium:   { wrapper: "bg-blue-100 text-blue-500",   dot: null,            label: "Medium"   },
  Low:      { wrapper: "bg-green-100 text-green-600", dot: null,            label: "Low"      },
};

const STATUS_STYLES = {
  verified:    "bg-green-100 text-green-700 border border-green-300 shadow-sm font-bold",
  unverified:  "bg-amber-100 text-amber-700 border border-amber-300",
  low_trust:   "bg-gray-100 text-gray-500 border border-gray-200 opacity-60",
  rejected:    "bg-red-100 text-red-700 border border-red-300",
  Active:      "bg-green-100 text-green-600 border border-green-200",
  Completed:   "bg-gray-100 text-gray-500 border border-gray-200",
  Pending:     "bg-amber-100 text-amber-600 border border-amber-200",
};

const CATEGORY_STYLES = {
  Food:       "bg-blue-50 text-blue-500 border border-blue-100",
  Healthcare: "bg-teal-50 text-teal-600 border border-teal-100",
  Education:  "bg-purple-50 text-purple-500 border border-purple-100",
  Shelter:    "bg-sky-50 text-sky-500 border border-sky-100",
  Employment: "bg-orange-50 text-orange-500 border border-orange-100",
};

function UrgencyBadge({ urgency }) {
  const cfg = URGENCY_STYLES[urgency] ?? URGENCY_STYLES.Medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.wrapper}`}>
      {cfg.dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] ?? STATUS_STYLES.Pending;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

function CategoryBadge({ category }) {
  const cls = CATEGORY_STYLES[category] ?? "bg-gray-100 text-gray-500 border border-gray-200";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {category}
    </span>
  );
}

export default function SurveyTableRow({ row, onView, onEdit, onDelete }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors group">

      {/* Title */}
      <td className="px-5 py-4 min-w-[160px]">
        <span className="text-sm font-bold text-gray-800 leading-snug">{row.title}</span>
      </td>

      {/* Category */}
      <td className="px-5 py-4">
        <CategoryBadge category={row.category} />
      </td>

      {/* Location */}
      <td className="px-5 py-4">
        <div className="flex items-start gap-1 text-gray-500">
          <LocationOnOutlinedIcon sx={{ fontSize: 15, mt: "1px", color: "#9CA3AF", flexShrink: 0 }} />
          <span className="text-xs font-medium text-gray-500 leading-snug">{row.location}</span>
        </div>
      </td>

      {/* Urgency */}
      <td className="px-5 py-4">
        <UrgencyBadge urgency={row.urgency} />
      </td>

      {/* Date */}
      <td className="px-5 py-4">
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{row.date}</span>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <StatusBadge status={row.status} />
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1">
          <Tooltip title="View" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => onView?.(row)}
              sx={{
                color: "#0EA5E9",
                "&:hover": { backgroundColor: "#E0F2FE" },
              }}
            >
              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => onEdit?.(row)}
              sx={{
                color: "#10B981",
                "&:hover": { backgroundColor: "#D1FAE5" },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => onDelete?.(row)}
              sx={{
                color: "#fb2c36",
                "&:hover": { backgroundColor: "#FEE2E2" },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}