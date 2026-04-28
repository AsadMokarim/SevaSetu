import React, { useState } from "react";
import { Select, MenuItem, FormControl, Button, OutlinedInput, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

/**
 * VolunteerFilterBar
 * Props: onSearch, onAddVolunteer, onFilterChange,
 *        skillOptions, availabilityOptions, sortOptions
 */
const DEFAULT_SKILLS = ["All Skills","Food Distribution","Healthcare","Education","Construction","Community Outreach","Leadership","Medical Professional","Training","First Aid"];
const DEFAULT_AVAIL  = ["All","Available","Unavailable"];
const DEFAULT_SORT   = ["Performance","Name","Tasks Completed","Hours Contributed"];

const selectSx = {
  borderRadius:"10px", fontSize:"13px", fontWeight:500, color:"#374151", backgroundColor:"#fff",
  "& .MuiOutlinedInput-notchedOutline":{ borderColor:"#E5E7EB" },
  "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:"#D1D5DB" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline":{ borderColor:"#93C5FD", boxShadow:"0 0 0 3px rgba(37,99,235,0.1)" },
  "& .MuiSelect-select":{ py:"7px" },
};
const menuSx = {
  PaperProps:{ sx:{
    borderRadius:"12px", mt:"6px", boxShadow:"0 8px 24px rgba(0,0,0,0.1)", border:"1px solid #E5E7EB",
    "& .MuiMenuItem-root":{ fontSize:"13px", fontWeight:500, color:"#374151", borderRadius:"8px",
      mx:"6px", my:"2px", px:"10px",
      "&:hover":{ backgroundColor:"#EFF6FF", color:"#2563EB" },
      "&.Mui-selected":{ backgroundColor:"#DBEAFE", color:"#1D4ED8", fontWeight:600,
        "&:hover":{ backgroundColor:"#BFDBFE" } },
    },
  }},
};

function FilterSelect({ label, value, options, onChange, minWidth = 150 }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">{label}:</span>
      <FormControl size="small" sx={{ minWidth }}>
        <Select value={value} onChange={(e) => onChange(e.target.value)}
          displayEmpty sx={selectSx} MenuProps={menuSx}>
          {options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </Select>
      </FormControl>
    </div>
  );
}

export default function VolunteerFilterBar({
  onSearch, onAddVolunteer, onFilterChange,
  skillOptions = DEFAULT_SKILLS,
  availabilityOptions = DEFAULT_AVAIL,
  sortOptions = DEFAULT_SORT,
}) {
  const [search, setSearch]   = useState("");
  const [skill,  setSkill]    = useState(skillOptions[0]);
  const [avail,  setAvail]    = useState(availabilityOptions[0]);
  const [sort,   setSort]     = useState(sortOptions[0]);

  function handleSearch(val) { setSearch(val); onSearch?.(val); }
  function handleFilter(key, val) {
    const next = { skill, avail, sort, [key]: val };
    if (key === "skill") setSkill(val);
    if (key === "avail") setAvail(val);
    if (key === "sort")  setSort(val);
    onFilterChange?.(next);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4 flex-wrap">
      {/* Search */}
      <OutlinedInput
        size="small"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search volunteers by name or email..."
        startAdornment={<InputAdornment position="start"><SearchIcon sx={{ fontSize:18, color:"#9CA3AF" }} /></InputAdornment>}
        endAdornment={search ? (
          <InputAdornment position="end">
            <CloseIcon onClick={() => handleSearch("")}
              sx={{ fontSize:17, color:"#9CA3AF", cursor:"pointer", "&:hover":{ color:"#6B7280" } }} />
          </InputAdornment>
        ) : null}
        sx={{
          width:300, borderRadius:"12px", fontSize:"13.5px", backgroundColor:"#F9FAFB",
          "& .MuiOutlinedInput-notchedOutline":{ borderColor:"#E5E7EB" },
          "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:"#D1D5DB" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline":{ borderColor:"#93C5FD", boxShadow:"0 0 0 3px rgba(37,99,235,0.1)" },
          "& input::placeholder":{ color:"#9CA3AF", opacity:1 },
          "& input":{ py:"9px" },
        }}
      />

      <FilterSelect label="Skills"        value={skill} options={skillOptions}        onChange={(v) => handleFilter("skill",v)} minWidth={160} />
      <FilterSelect label="Availability"  value={avail} options={availabilityOptions} onChange={(v) => handleFilter("avail",v)} minWidth={120} />
      <FilterSelect label="Sort by"       value={sort}  options={sortOptions}          onChange={(v) => handleFilter("sort",v)}  minWidth={160} />

      <Button onClick={onAddVolunteer} variant="contained" startIcon={<AddIcon />}
        sx={{
          ml:"auto", borderRadius:"12px", backgroundColor:"#2563EB", textTransform:"none",
          fontWeight:600, fontSize:"13.5px", whiteSpace:"nowrap", px:"20px", py:"10px",
          boxShadow:"0 1px 3px rgba(37,99,235,0.3)", "&:hover":{ backgroundColor:"#1d4ed8" },
        }}>
        Add Volunteer
      </Button>
    </div>
  );
}