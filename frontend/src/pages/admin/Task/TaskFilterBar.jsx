import React, { useState } from "react";
import { Select, MenuItem, FormControl, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

/**
 * TaskFilterBar
 * Props:
 *  totalCount    {number}
 *  filteredCount {number}
 *  statusOptions {string[]}
 *  urgencyOptions{string[]}
 *  categoryOptions{string[]}
 *  onFilterChange{function} ({ status, urgency, category }) => void
 *  onAddTask     {function} () => void
 */

const DEFAULT_STATUS  = ["All Status", "Assigned", "In Progress", "Completed", "Pending"];
const DEFAULT_URGENCY = ["All Urgency", "Critical", "High", "Medium", "Low"];
const DEFAULT_CATEGORY = ["All Category", "General", "Food", "Medical", "Education", "Rescue", "Shelter", "Community"];

const selectSx = {
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: 500,
  color: "#374151",
  backgroundColor: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#93C5FD",
    boxShadow: "0 0 0 3px rgba(37,99,235,0.1)",
  },
  "& .MuiSelect-select": { py: "7px" },
};

const menuSx = {
  PaperProps: {
    sx: {
      borderRadius: "12px", mt: "6px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      border: "1px solid #E5E7EB",
      "& .MuiMenuItem-root": {
        fontSize: "13px", fontWeight: 500, color: "#374151",
        borderRadius: "8px", mx: "6px", my: "2px", px: "10px",
        "&:hover": { backgroundColor: "#EFF6FF", color: "#2563EB" },
        "&.Mui-selected": { backgroundColor: "#DBEAFE", color: "#1D4ED8", fontWeight: 600,
          "&:hover": { backgroundColor: "#BFDBFE" } },
      },
    },
  },
};

function FilterSelect({ label, value, options, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">{label}:</span>
      <FormControl size="small" sx={{ minWidth: 130 }}>
        <Select value={value} onChange={(e) => onChange(e.target.value)}
          displayEmpty sx={selectSx} MenuProps={menuSx}>
          {options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </Select>
      </FormControl>
    </div>
  );
}

export default function TaskFilterBar({
  totalCount = 6, filteredCount = 6,
  statusOptions = DEFAULT_STATUS, urgencyOptions = DEFAULT_URGENCY, categoryOptions = DEFAULT_CATEGORY,
  onFilterChange, onAddTask,
}) {
  const [status,  setStatus]  = useState(statusOptions[0]);
  const [urgency, setUrgency] = useState(urgencyOptions[0]);
  const [category, setCategory] = useState(categoryOptions[0]);

  function handle(key, val) {
    const next = { status, urgency, category, [key]: val };
    if (key === "status")  setStatus(val);
    if (key === "urgency") setUrgency(val);
    if (key === "category") setCategory(val);
    onFilterChange?.(next);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-5 flex-wrap">
      <FilterSelect label="Status"  value={status}  options={statusOptions}  onChange={(v) => handle("status", v)} />
      <FilterSelect label="Urgency" value={urgency} options={urgencyOptions} onChange={(v) => handle("urgency", v)} />
      <FilterSelect label="Category" value={category} options={categoryOptions} onChange={(v) => handle("category", v)} />

      <span className="text-sm text-gray-400 ml-2">
        Showing <span className="font-semibold text-gray-600">{filteredCount}</span> of{" "}
        <span className="font-semibold text-gray-600">{totalCount}</span> tasks
      </span>

      <Button onClick={onAddTask} variant="contained" startIcon={<AddIcon />}
        sx={{
          ml: "auto", borderRadius: "12px", backgroundColor: "#2563EB",
          textTransform: "none", fontWeight: 600, fontSize: "13.5px",
          px: "20px", py: "10px", whiteSpace: "nowrap",
          boxShadow: "0 1px 3px rgba(37,99,235,0.3)",
          "&:hover": { backgroundColor: "#1d4ed8" },
        }}>
        Add Task
      </Button>
    </div>
  );
}