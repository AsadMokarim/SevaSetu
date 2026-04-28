import React, { useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";

export default function ActiveTaskCard({ task, onComplete }) {
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    await onComplete(task);
    setCompleting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 w-full flex flex-col h-full relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />

      {/* Icon and Title */}
      <div className="flex items-start gap-4 mb-4 mt-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <AssignmentTurnedInOutlinedIcon />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{task.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
        </div>
      </div>

      {/* Meta details */}
      <div className="space-y-3 mb-6 mt-auto bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center gap-3 text-gray-700">
          <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
          <span className="text-sm font-medium">{task.location || task.distance}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
          <span className="text-sm font-medium">
            {task.date} • {task.time}
          </span>
        </div>

        {/* Colleagues Section */}
        {task.colleagues && task.colleagues.length > 0 && (
          <div className="pt-3 mt-1 border-t border-gray-100">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Team Members</p>
            <div className="flex flex-wrap gap-1.5">
              {task.colleagues.map((col, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">
                    {col.charAt(0)}
                  </div>
                  <span className="text-xs font-medium">{col}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <Button
        fullWidth
        variant="contained"
        onClick={handleComplete}
        disabled={completing}
        startIcon={completing ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineIcon />}
        sx={{
          backgroundColor: "#10B981",
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "12px",
          py: 1.5,
          boxShadow: "0 2px 4px rgba(16,185,129,0.2)",
          "&:hover": { backgroundColor: "#059669" },
        }}
      >
        {completing ? "Completing..." : "Mark as Complete"}
      </Button>
    </div>
  );
}
