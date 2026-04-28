import React from "react";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

export default function RecommendedTaskCard({
  task,
  onAccept,
  onDismiss,
  accepting,
}) {
  const isMedical = task.title.toLowerCase().includes("medical");
  const CardIcon = isMedical ? FavoriteBorderIcon : AddIcon;

  return (
    <div className="bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm p-6 w-full flex flex-col h-full relative">
      {/* Icon and Title */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-blue-600 shrink-0">
          <CardIcon />
        </div>
        <div>
          <h3 className="text-lg font-bold text-blue-900 mb-1">{task.title}</h3>
          <p className="text-sm text-blue-400">{task.description}</p>
        </div>
      </div>

      {/* AI Match Reason */}
      {task.aiMatchReason && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex items-start gap-3 shadow-sm">
          <AutoAwesomeIcon sx={{ color: "#3B82F6", fontSize: 20, mt: 0.25 }} />
          <div>
            <p className="text-xs font-bold text-gray-800 mb-0.5">AI Match Reason</p>
            <p className="text-xs text-blue-500">{task.aiMatchReason}</p>
          </div>
        </div>
      )}

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
        <div>
          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
            <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
            <p className="text-xs font-semibold">Distance</p>
          </div>
          <p className="text-sm font-bold text-gray-800 pl-5.5">{task.distance}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
            <GroupOutlinedIcon sx={{ fontSize: 16 }} />
            <p className="text-xs font-semibold">Needed</p>
          </div>
          <p className="text-sm font-bold text-gray-800 pl-5.5">
            {task.volunteersNeeded} volunteers
          </p>
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-2 text-blue-500 mb-5">
        <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
        <span className="text-xs font-medium">
          {task.date} • {task.time}
        </span>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 mb-6">
        {task.tags?.map((tag, idx) => {
          const isCritical = tag.label.toLowerCase() === "critical" || tag.label.toLowerCase() === "high";
          const tagBg = isCritical ? "bg-red-50 border-red-100" : "bg-white border-gray-200";
          const tagText = isCritical ? "text-red-500" : "text-gray-500";
          const Dot = isCritical ? (
            <span className={`w-1.5 h-1.5 rounded-full ${tag.label.toLowerCase() === "critical" ? "bg-red-500" : "bg-amber-400"} mr-1.5`} />
          ) : null;

          return (
            <span
              key={idx}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${tagBg} ${tagText}`}
            >
              {Dot}
              {tag.label}
            </span>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-auto">
        <Button
          fullWidth
          variant="contained"
          onClick={() => onAccept(task)}
          disabled={accepting}
          startIcon={accepting ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
          sx={{
            backgroundColor: "#2563EB",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "12px",
            py: 1.5,
            boxShadow: "0 2px 4px rgba(37,99,235,0.2)",
            "&:hover": { backgroundColor: "#1d4ed8" },
          }}
        >
          {accepting ? "Accepting..." : "Accept Task"}
        </Button>
        <IconButton
          onClick={() => onDismiss(task)}
          disabled={accepting}
          sx={{
            backgroundColor: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            width: "48px",
            height: "48px",
            "&:hover": { backgroundColor: "#F3F4F6" },
          }}
        >
          <CloseIcon sx={{ color: "#9CA3AF" }} />
        </IconButton>
      </div>
    </div>
  );
}
