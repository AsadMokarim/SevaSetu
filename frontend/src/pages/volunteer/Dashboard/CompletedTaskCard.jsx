import React from "react";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function CompletedTaskCard({ task }) {
  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 w-full flex flex-col h-full relative opacity-80 transition-all hover:opacity-100">
      {/* Icon and Title */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
          <CheckCircleIcon sx={{ fontSize: 20 }} className="text-emerald-500" />
        </div>
        <div>
          <h3 className="text-md font-bold text-gray-800 mb-0.5 line-clamp-1">{task.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-1">Completed successfully</p>
        </div>
      </div>

      {/* Meta details */}
      <div className="space-y-2 mt-auto">
        <div className="flex items-center gap-2 text-gray-500">
          <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
          <span className="text-xs">{task.location}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />
          <span className="text-xs">
            {task.date}
          </span>
        </div>
      </div>
    </div>
  );
}
