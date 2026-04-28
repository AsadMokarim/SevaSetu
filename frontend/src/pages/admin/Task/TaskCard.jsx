import React, { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import EditOutlinedIcon          from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon         from "@mui/icons-material/DeleteOutline";
import LocationOnOutlinedIcon    from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import GroupOutlinedIcon         from "@mui/icons-material/GroupOutlined";
import PersonAddAltIcon          from "@mui/icons-material/PersonAddAlt";
import AutoAwesomeIcon           from "@mui/icons-material/AutoAwesome";
import ElectricBoltIcon          from "@mui/icons-material/ElectricBolt";
import CheckCircleOutlineIcon    from "@mui/icons-material/CheckCircleOutline";
import VolunteerChip             from "./VolunteerChip";
import AIRecommendation          from "./AIRecommendation";
import MatchInsightsDialog       from "./MatchInsightsDialog";

/**
 * TaskCard
 * Props:
 *  task {object} — shape below
 *  onEdit   {function} (task) => void
 *  onDelete {function} (task) => void
 *  onAssignVolunteer  {function} (task) => void
 *  onAIAssign {function} (task, volunteer) => void
 *
 * task shape:
 * {
 *   id, title, description, location, date,
 *   urgency: "Critical"|"High"|"Medium"|"Low",
 *   status:  "Assigned"|"In Progress"|"Completed"|"Pending",
 *   category, volunteers: [{name}], totalVolunteers: number,
 *   aiRecommendation: { matchPercent, volunteerName, volunteerMeta } | null
 * }
 */

const URGENCY_CFG = {
  critical: { dot: "bg-red-500",    text: "text-red-500",    label: "Critical" },
  high:     { dot: "bg-amber-400",  text: "text-amber-500",  label: "High"     },
  medium:   { dot: "bg-blue-400",   text: "text-blue-500",   label: "Medium"   },
  low:      { dot: "bg-green-400",  text: "text-green-600",  label: "Low"      },
};

const URGENCY_MAP = (key) => {
  if (!key) return URGENCY_CFG.medium;
  const k = key.toLowerCase();
  return URGENCY_CFG[k] || URGENCY_CFG.medium;
};

const STATUS_CFG = {
  Assigned:    "bg-blue-50 text-blue-600 border border-blue-200",
  "In Progress":"bg-amber-50 text-amber-600 border border-amber-200",
  Completed:   "bg-green-50 text-green-600 border border-green-200",
  Pending:     "bg-gray-100 text-gray-500 border border-gray-200",
};

const CATEGORY_CFG = {
  Food:       "bg-blue-50 text-blue-500 border border-blue-100",
  Healthcare: "bg-teal-50 text-teal-600 border border-teal-100",
  Education:  "bg-purple-50 text-purple-500 border border-purple-100",
  Shelter:    "bg-sky-50 text-sky-500 border border-sky-100",
  Employment: "bg-orange-50 text-orange-500 border border-orange-100",
};

export default function TaskCard({ task, onEdit, onDelete, onAssignVolunteer, onAIAssign, onUnassign, onAdminComplete }) {
  const urgency   = URGENCY_MAP(task.priority || task.urgency);
  const statusCls = STATUS_CFG[task.status]   ?? STATUS_CFG.Pending;
  const catCls    = CATEGORY_CFG[task.category] ?? "bg-gray-100 text-gray-500 border border-gray-200";
  const needed    = task.total_volunteers - (task.assignments?.length ?? 0);
  const isCritical = (task.priority || task.urgency || '').toLowerCase() === 'critical';

  const [matchesOpen, setMatchesOpen] = useState(false);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 w-full transition-all ${
      isCritical ? 'border-red-200 shadow-red-50' : 'border-gray-200'
    }`}>

      {/* ── Emergency Mode Banner ── */}
      {isCritical && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 mb-3">
          <ElectricBoltIcon sx={{ color: '#EF4444', fontSize: 16 }} />
          <p className="text-xs font-bold text-red-600">⚡ Emergency Mode — Priority matching applied</p>
        </div>
      )}

      {/* ── Top row: title + status + actions ── */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <h3 className="text-base font-bold text-gray-900 leading-snug">{task.title}</h3>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusCls}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              {task.status}
            </span>

            <Tooltip title="Edit" arrow placement="top">
              <IconButton size="small" onClick={() => onEdit?.(task)}
                sx={{ color: "#10B981", "&:hover": { backgroundColor: "#D1FAE5" } }}>
                <EditOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" arrow placement="top">
              <IconButton size="small" onClick={() => onDelete?.(task)}
                sx={{ color: "#fb2c36", "&:hover": { backgroundColor: "#FEE2E2" } }}>
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </div>

          {/* Mark Completed mini button */}
          {(task.status || '').toLowerCase() !== 'completed' && task.assignments?.length > 0 && (
            <button
              onClick={() => onAdminComplete?.(task)}
              className="flex items-center gap-1 px-2.5 py-1 mt-0.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors"
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
              Complete
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-3">{task.description}</p>

      {/* ── Meta row: location · date · urgency · volunteers · category ── */}
      <div className="flex items-center gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-1 text-gray-500">
          <LocationOnOutlinedIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
          <span className="text-xs font-medium text-gray-500">{task.location}</span>
        </div>

        <div className="flex items-center gap-1 text-gray-500">
          <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
          <span className="text-xs font-medium text-gray-500">{task.date}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${urgency.dot}`} />
          <span className={`text-xs font-semibold ${urgency.text}`}>{urgency.label}</span>
        </div>

        <div className="flex items-center gap-1 text-gray-500">
          <GroupOutlinedIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
          <span className="text-xs font-medium text-gray-500">
            <span className="font-bold text-gray-700">{task.assignments?.length ?? 0}</span>
            /{task.total_volunteers} volunteers
          </span>
        </div>

        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${catCls}`}>
          {task.category}
        </span>
      </div>

      {/* ── Assigned Volunteers ── */}
      {task.assignments?.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 mb-3">
          <p className="text-xs font-bold text-gray-600 mb-2.5">Team Members:</p>
          <div className="flex flex-col gap-2">
            {task.assignments.map((a, i) => (
              <div key={a.volunteer_id || i} className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <VolunteerChip
                      name={a.volunteer_name}
                      onDelete={() => onUnassign?.(task, a.volunteer_id)}
                    />
                    {/* Score badge */}
                    {a.score != null && (
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">
                        {a.score} pts
                      </span>
                    )}
                    {/* Status badge */}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                      a.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                      a.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                  {/* Explanation */}
                  {a.explanation && (
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{a.explanation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI Recommendation(s) ── */}
      {task.aiRecommendation && (
        <div className="flex flex-col gap-3 mb-3">
          {(Array.isArray(task.aiRecommendation) ? task.aiRecommendation : [task.aiRecommendation]).map((rec, idx) => (
            <AIRecommendation
              key={idx}
              {...rec}
              onAssign={() => onAIAssign?.(task, rec)}
            />
          ))}
        </div>
      )}

      {/* ── Bottom actions row ── */}
      <div className="flex gap-2">
        {/* Assign button */}
        {needed > 0 && (task.status || '').toLowerCase() !== 'completed' && (
          <button
            onClick={() => onAssignVolunteer?.(task)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-blue-200 text-blue-500 text-sm font-semibold hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <PersonAddAltIcon sx={{ fontSize: 16 }} />
            Assign ({needed} needed)
          </button>
        )}


        {/* View Matches button */}
        <button
          onClick={() => setMatchesOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-blue-100 bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition-colors"
        >
          <AutoAwesomeIcon sx={{ fontSize: 15 }} />
          Matches
        </button>
      </div>

      {/* ── Match Insights Dialog ── */}
      <MatchInsightsDialog
        open={matchesOpen}
        onClose={() => setMatchesOpen(false)}
        task={task}
        onAssign={onAIAssign}
      />
    </div>
  );
}