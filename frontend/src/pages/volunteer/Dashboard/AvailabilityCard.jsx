import React from "react";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";

export default function AvailabilityCard({ isAvailable, onToggle, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isAvailable ? "bg-emerald-500" : "bg-gray-300"
            }`}
          />
          <h3 className="text-lg font-bold text-gray-800">
            {isAvailable ? "Available" : "Unavailable"}
          </h3>
        </div>
        <p className="text-sm text-gray-400">
          {isAvailable
            ? "You can receive task assignments"
            : "You will not receive task assignments"}
        </p>
      </div>

      <div className="flex items-center">
        {loading && <CircularProgress size={20} sx={{ mr: 2, color: "#10B981" }} />}
        <Switch
          checked={isAvailable}
          onChange={onToggle}
          disabled={loading}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: "#10B981",
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: "#10B981",
            },
          }}
        />
      </div>
    </div>
  );
}
