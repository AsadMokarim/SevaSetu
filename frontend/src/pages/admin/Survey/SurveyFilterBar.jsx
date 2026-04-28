import React, { useState } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  OutlinedInput,
  Button,
  Box,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

/**
 * SurveyFilterBar
 *
 * Props:
 *  onSearch        {function}  (value: string) => void
 *  onAddSurvey     {function}  () => void
 *  onFilterChange  {function}  ({ category, urgency, location }) => void
 *  totalCount      {number}
 *  filteredCount   {number}
 *  categoryOptions {string[]}
 *  urgencyOptions  {string[]}
 *  locationOptions {string[]}
 */

const DEFAULT_CATEGORIES = ["All Categories", "Food", "Healthcare", "Education", "Shelter", "Employment"];
const DEFAULT_URGENCIES  = ["All Urgency Levels", "Critical", "High", "Medium", "Low"];
const DEFAULT_LOCATIONS  = ["All Locations", "North District", "South District", "East District", "West District", "Central District"];

/* ── Shared MUI Select styles ───────────────────────────── */
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
  "& .MuiSelect-select": { py: "7px", pr: "32px !important" },
};

const labelSx = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#4B5563",
  "&.Mui-focused": { color: "#2563EB" },
};

/* ── Reusable FilterSelect ──────────────────────────────── */
function FilterSelect({ label, value, options, onChange }) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
        {label}:
      </span>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <Select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          displayEmpty
          sx={selectSx}
          MenuProps={{
            PaperProps: {
              sx: {
                borderRadius: "12px",
                mt: "6px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                border: "1px solid #E5E7EB",
                "& .MuiMenuItem-root": {
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#374151",
                  borderRadius: "8px",
                  mx: "6px",
                  my: "2px",
                  px: "10px",
                  "&:hover": { backgroundColor: "#EFF6FF", color: "#2563EB" },
                  "&.Mui-selected": {
                    backgroundColor: "#DBEAFE",
                    color: "#1D4ED8",
                    fontWeight: 600,
                    "&:hover": { backgroundColor: "#BFDBFE" },
                  },
                },
              },
            },
          }}
        >
          {options.map((opt) => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function SurveyFilterBar({
  onSearch,
  onAddSurvey,
  onFilterChange,
  totalCount = 8,
  filteredCount = 8,
  categoryOptions = DEFAULT_CATEGORIES,
  urgencyOptions  = DEFAULT_URGENCIES,
  locationOptions = DEFAULT_LOCATIONS,
}) {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [urgency,  setUrgency]  = useState(urgencyOptions[0]);
  const [location, setLocation] = useState(locationOptions[0]);

  function handleSearch(val) {
    setSearch(val);
    onSearch?.(val);
  }

  function handleFilter(key, val) {
    const next = { category, urgency, location, [key]: val };
    if (key === "category") setCategory(val);
    if (key === "urgency")  setUrgency(val);
    if (key === "location") setLocation(val);
    onFilterChange?.(next);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 w-full">

      {/* ── Row 1: Search + Add button ── */}
      <div className="flex items-center gap-3 mb-4">

        {/* MUI OutlinedInput for search */}
        <OutlinedInput
          fullWidth
          size="small"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search surveys by title or location..."
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />
            </InputAdornment>
          }
          endAdornment={
            search ? (
              <InputAdornment position="end">
                <CloseIcon
                  onClick={() => handleSearch("")}
                  sx={{ fontSize: 17, color: "#9CA3AF", cursor: "pointer", "&:hover": { color: "#6B7280" } }}
                />
              </InputAdornment>
            ) : null
          }
          sx={{
            borderRadius: "12px",
            fontSize: "13.5px",
            backgroundColor: "#F9FAFB",
            color: "#374151",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#93C5FD",
              boxShadow: "0 0 0 3px rgba(37,99,235,0.1)",
            },
            "& input::placeholder": { color: "#9CA3AF", opacity: 1 },
            "& input": { py: "10px" },
          }}
        />

        {/* Add Survey — MUI Button */}
        <Button
          onClick={onAddSurvey}
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          sx={{
            borderRadius: "12px",
            backgroundColor: "#2563EB",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "13.5px",
            whiteSpace: "nowrap",
            px: "20px",
            py: "10px",
            boxShadow: "0 1px 3px rgba(37,99,235,0.3)",
            "&:hover": { backgroundColor: "#1d4ed8", boxShadow: "0 2px 8px rgba(37,99,235,0.35)" },
            "&:active": { backgroundColor: "#1e40af" },
          }}
        >
          Add Survey
        </Button>
      </div>

      {/* ── Row 2: Filters + count ── */}
      <div className="flex items-center gap-5 flex-wrap">
        <FilterSelect
          label="Category"
          value={category}
          options={categoryOptions}
          onChange={(v) => handleFilter("category", v)}
        />
        <FilterSelect
          label="Urgency"
          value={urgency}
          options={urgencyOptions}
          onChange={(v) => handleFilter("urgency", v)}
        />
        <FilterSelect
          label="Location"
          value={location}
          options={locationOptions}
          onChange={(v) => handleFilter("location", v)}
        />

        <span className="ml-auto text-sm text-gray-400 whitespace-nowrap">
          Showing{" "}
          <span className="font-semibold text-gray-600">{filteredCount}</span>
          {" "}of{" "}
          <span className="font-semibold text-gray-600">{totalCount}</span>
          {" "}surveys
        </span>
      </div>
    </div>
  );
}