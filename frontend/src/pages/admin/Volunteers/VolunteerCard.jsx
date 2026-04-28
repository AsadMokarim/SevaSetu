import React, { useState } from "react";
import { Button, IconButton, Tooltip, Switch } from "@mui/material";
import PersonOutlineIcon  from "@mui/icons-material/PersonOutline";
import EditOutlinedIcon   from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon  from "@mui/icons-material/DeleteOutline";
import EmojiEventsIcon    from "@mui/icons-material/EmojiEvents";
import StarIcon           from "@mui/icons-material/Star";
import CircularScore from "./CircularScore";
import SkillChip     from "./SkillChip";

import { getInitials } from "../../../utils/volunteerUtils";
/**
 * VolunteerCard
 * Props:
 *  volunteer {object} — shape below
 *  onView    {fn}   onEdit {fn}   onDelete {fn}   onToggle {fn}
 *
 * volunteer shape:
 * { id, name, email, location, initials, avatarColor,
 *   badge: "Top Performer"|"Highly Reliable"|null,
 *   performanceScore, tasksCompleted, hoursContributed,
 *   skills: string[], available: boolean }
 */

const BADGE_CFG = {
  "Top Performer":  { icon: EmojiEventsIcon, bg:"bg-amber-400",  text:"text-white", label:"Top Performer"  },
  "Highly Reliable":{ icon: StarIcon,        bg:"bg-blue-600",   text:"text-white", label:"Highly Reliable"},
};

const AVATAR_BG = {
  blue:   "bg-blue-600",
  green:  "bg-emerald-500",
  purple: "bg-purple-600",
  amber:  "bg-amber-500",
  rose:   "bg-rose-500",
  teal:   "bg-teal-600",
};

export default function VolunteerCard({ volunteer: v, onView, onEdit, onDelete, onToggle }) {
  const [available, setAvailable] = useState(v.available ?? true);
  const badge = v.badge ? BADGE_CFG[v.badge] : null;
  const BadgeIcon = badge?.icon;
  const avatarBg = AVATAR_BG[v.avatarColor] ?? "bg-blue-600";

  function handleToggle() {
    setAvailable((prev) => !prev);
    onToggle?.({ ...v, available: !available });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col w-full">

      {/* ── Header band ── */}
      <div className="bg-blue-50 px-5 pt-5 pb-4 relative">
        {/* Badge */}
        {badge && (
          <div className={`absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
            <BadgeIcon sx={{ fontSize: 13 }} />
            {badge.label}
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className={`w-16 h-16 rounded-full ${avatarBg} flex items-center justify-center`}>
              <span className="text-white text-lg font-bold tracking-wide">{getInitials(v.name)}</span>
            </div>
            {/* Online dot */}
            {available && (
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
            )}
          </div>

          {/* Name / email / location */}
          <div className="min-w-0">
            <p className="text-base font-bold text-blue-700 leading-snug truncate">{v.name}</p>
            <p className="text-xs text-blue-400 truncate">{v.email}</p>
            <p className="text-xs text-gray-500 mt-0.5">{v.location}</p>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 py-4 flex flex-col gap-4 flex-1">

        {/* Performance Score */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Performance Score</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-500">
                {typeof v.performanceScore === 'number' ? parseFloat(v.performanceScore.toFixed(1)) : 0}
              </span>
              <span className="text-sm text-gray-400">/ 100</span>
            </div>
          </div>
          <CircularScore score={v.performanceScore} size={68} strokeWidth={6} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Tasks Completed",   value: v.tasksCompleted },
            { label: "Hours Contributed", value: `${v.hoursContributed?.toFixed(1) || 0}h` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
              <p className="text-lg font-bold text-gray-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {(Array.isArray(v.skills) ? v.skills : (typeof v.skills === 'string' ? v.skills.split(',').map(s => s.trim()) : [])).map((s) => (
               <SkillChip key={s} label={s} />
            ))}
          </div>
        </div>

        {/* Availability toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${available ? "bg-emerald-500" : "bg-gray-300"}`} />
            <span className="text-sm font-semibold text-gray-700">
              {available ? "Available" : "Unavailable"}
            </span>
          </div>
          <Switch
            checked={available}
            onChange={handleToggle}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: "#10B981" },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#10B981" },
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            onClick={() => onView?.(v)}
            variant="contained"
            startIcon={<PersonOutlineIcon />}
            fullWidth
            sx={{
              borderRadius:"10px", backgroundColor:"#2563EB", textTransform:"none",
              fontWeight:600, fontSize:"13px", py:"9px",
              boxShadow:"0 1px 3px rgba(37,99,235,0.25)",
              "&:hover":{ backgroundColor:"#1d4ed8" },
            }}
          >
            View Profile
          </Button>
          <Tooltip title="Edit" arrow>
            <IconButton size="small" onClick={() => onEdit?.(v)}
              sx={{ color:"#10B981", border:"1px solid #D1FAE5", borderRadius:"8px",
                    "&:hover":{ backgroundColor:"#D1FAE5" } }}>
              <EditOutlinedIcon sx={{ fontSize:18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <IconButton size="small" onClick={() => onDelete?.(v)}
              sx={{ color:"#fb2c36", border:"1px solid #FEE2E2", borderRadius:"8px",
                    "&:hover":{ backgroundColor:"#FEE2E2" } }}>
              <DeleteOutlineIcon sx={{ fontSize:18 }} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}