import React, { useState, useEffect } from "react";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BarChartIcon from "@mui/icons-material/BarChart";

import VolunteerStatCard from "./VolunteerStatCard";
import VolunteerFilterBar from "./VolunteerFilterBar";
import VolunteerGrid from "./VolunteerGrid";
import { VolunteerFormDialog, DeleteVolunteerDialog } from "./VolunteerDialogs";
import ViewVolunteerDialog from "./ViewVolunteerDialog";
import { getVolunteers, updateVolunteer } from "../../../api/volunteerApi";
import { useError } from "../../../contexts/ErrorContext";

// Removed SAMPLE_VOLUNTEERS to use real Firestore data exclusively.

export default function VolunteerPage() {
  const { showError } = useError();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ skill: "All Skills", avail: "All", sort: "Performance" });

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const data = await getVolunteers();
      const volunteersList = Array.isArray(data) ? data : (data?.volunteers || []);
      
      const mappedData = volunteersList.map(v => ({
        ...v,
        id: v.uid || v.id,
        performanceScore: v.performance_score || 0,
        tasksCompleted: v.tasks_completed || 0,
        hoursContributed: v.hours_contributed || 0,
        available: v.is_available ?? true,
        avatarColor: v.avatarColor || "blue",
        badge: (v.performance_score || 0) >= 95 ? "Top Performer" : ((v.performance_score || 0) >= 90 ? "Highly Reliable" : null)
      }));
      setVolunteers(mappedData);
    } catch (e) {
      showError("Failed to fetch volunteers: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  // Filter Logic
  const filteredVolunteers = volunteers.filter(v => {
    // Search
    if (searchQuery && !v.name?.toLowerCase().includes(searchQuery.toLowerCase()) && !v.email?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Skill
    if (filters.skill !== "All Skills") {
      if (!v.skills || !v.skills.includes(filters.skill)) return false;
    }

    // Availability
    if (filters.avail !== "All") {
      const isAvail = v.available === true || v.is_available === true;
      if (filters.avail === "Available" && !isAvail) return false;
      if (filters.avail === "Unavailable" && isAvail) return false;
    }

    return true;
  }).sort((a, b) => {
    // Sort
    if (filters.sort === "Name") return (a.name || "").localeCompare(b.name || "");
    if (filters.sort === "Tasks Completed") return (b.tasksCompleted || b.tasks_completed || 0) - (a.tasksCompleted || a.tasks_completed || 0);
    if (filters.sort === "Hours Contributed") return (b.hoursContributed || b.hours_contributed || 0) - (a.hoursContributed || a.hours_contributed || 0);
    // Default Performance
    return (b.performanceScore || b.performance_score || 0) - (a.performanceScore || a.performance_score || 0);
  });

  const totalVolunteers = volunteers.length;
  const availableNow = volunteers.filter((v) => v.available === true || v.is_available === true).length;
  const topPerformers = volunteers.filter((v) => (v.performanceScore || v.performance_score || 0) >= 90).length;
  const avgPerformance = totalVolunteers ? Math.round(volunteers.reduce((s, v) => s + (v.performanceScore || v.performance_score || 0), 0) / volunteers.length) : 0;

  const stats = [
    { head: "Total Volunteers", icon: GroupsOutlinedIcon, number: totalVolunteers, color: "blue" },
    { head: "Available Now", icon: CheckCircleOutlineIcon, number: availableNow, color: "green" },
    { head: "Top Performers", icon: AutoAwesomeIcon, number: topPerformers, color: "amber" },
    { head: "Avg Performance", icon: BarChartIcon, number: avgPerformance, color: "purple" },
  ];

  const handleToggleVolunteer = async (volunteer) => {
    try {
      await updateVolunteer(volunteer.id, { is_available: volunteer.available });
      await fetchVolunteers();
    } catch (e) {
      showError("Failed to update availability: " + e.message);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5 bg-gray-50 min-h-screen">
      {/* Stat cards */}
      <div className="flex gap-4 flex-wrap">
        {stats.map((s) => <VolunteerStatCard key={s.head} {...s} />)}
      </div>

      {/* Filter bar */}
      <VolunteerFilterBar
        onAddVolunteer={() => { setEditData(null); setFormDialogOpen(true); }}
        onSearch={(q) => setSearchQuery(q)}
        onFilterChange={(f) => setFilters(f)}
      />

      {/* Grid */}
      <VolunteerGrid
        volunteers={filteredVolunteers}
        onView={(v) => { setViewData(v); setViewDialogOpen(true); }}
        onEdit={(v) => { setEditData(v); setFormDialogOpen(true); }}
        onDelete={(v) => { setDeleteData(v); setDeleteDialogOpen(true); }}
        onToggle={handleToggleVolunteer}
      />

      {/* Dialogs */}
      <VolunteerFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        initialData={editData}
        onSuccess={fetchVolunteers}
      />
      
      <DeleteVolunteerDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        volunteer={deleteData}
        onSuccess={fetchVolunteers}
      />

      <ViewVolunteerDialog 
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        volunteer={viewData}
      />
    </div>
  );
}