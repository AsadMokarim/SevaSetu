import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import DashboardHeader from "./DashboardHeader";
import AvailabilityCard from "./AvailabilityCard";
import StatCard from "./StatCard";
import RecommendedTaskCard from "./RecommendedTaskCard";
import ActiveTaskCard from "./ActiveTaskCard";
import CompletedTaskCard from "./CompletedTaskCard";
import ProfileUpdateDialog from "./ProfileUpdateDialog";
import { AddSurveyDialog } from "../../admin/Survey/SurveyDialogs";

import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";

import { useAuth } from "../../../contexts/AuthContext";
import { useNotification } from "../../../contexts/ErrorContext";
import { getVolunteer, updateVolunteer } from "../../../api/volunteerApi";
import { getTasks, volunteerAcceptTask, volunteerRejectTask, volunteerCompleteTask } from "../../../api/taskApi";

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const { showSuccess } = useNotification();
  const [volunteer, setVolunteer] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTasksList, setActiveTasksList] = useState([]);
  const [completedTasksList, setCompletedTasksList] = useState([]);
  const [activeTasks, setActiveTasks] = useState(0);
  
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [addSurveyOpen, setAddSurveyOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [acceptingTasks, setAcceptingTasks] = useState({});

  useEffect(() => {
    if (user?.uid) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [volData, allTasks] = await Promise.all([
        getVolunteer(user.uid),
        getTasks()
      ]);
      setVolunteer(volData);

      // Find tasks assigned to this user
      let recs = [];
      let activeList = [];
      let historyList = [];
      let activeCount = 0;

      for (const task of allTasks) {
        const assignment = task.assignments?.find(a => a.volunteer_id === user.uid);
        if (assignment) {
          const status = assignment.status.toUpperCase();
          if (status === 'ASSIGNED') {
            // Include task AI recommendation text if it exists
            const aiRec = task.aiRecommendation;
            let reason = "Matched to your skills and availability.";
            if (aiRec) {
                // aiRecommendation is an array if multiple volunteers matched
                const recObj = Array.isArray(aiRec) ? aiRec.find(r => r.volunteer_id === user.uid) : aiRec;
                if (recObj && recObj.reason) reason = recObj.reason;
            }
            // Format tags
            const tags = [];
            if (task.urgency === 'high' || task.urgency === 'critical') {
              tags.push({ label: task.urgency.charAt(0).toUpperCase() + task.urgency.slice(1), color: 'error' });
            }
            if (task.category) {
              tags.push({ label: task.category.charAt(0).toUpperCase() + task.category.slice(1), color: 'default' });
            }

            // Format date and time
            let dateStr = "TBD";
            let timeStr = "TBD";
            if (task.event_date) {
              const d = new Date(task.event_date);
              dateStr = d.toLocaleDateString();
              timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            recs.push({ 
              ...task, 
              aiMatchReason: reason,
              distance: "Nearby", // Add proper distance logic later if needed
              volunteersNeeded: task.people_needed || 1,
              date: dateStr,
              time: timeStr,
              tags: tags
            });
          } else if (status === 'ACCEPTED') {
            // Format date and time for active tasks too
            let dateStr = "TBD";
            let timeStr = "TBD";
            if (task.event_date) {
              const d = new Date(task.event_date);
              dateStr = d.toLocaleDateString();
              timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            activeList.push({
                ...task,
                distance: "Nearby",
                date: dateStr,
                time: timeStr,
                colleagues: task.assignments
                  ?.filter(a => a.volunteer_id !== user.uid && a.status.toUpperCase() === 'ACCEPTED')
                  .map(a => a.volunteer_name) || []
            });
            activeCount++;
          } else if (status === 'COMPLETED') {
            let dateStr = "TBD";
            if (task.event_date) {
                dateStr = new Date(task.event_date).toLocaleDateString();
            }
            historyList.push({ ...task, date: dateStr });
          }
        }
      }

      setRecommendations(recs);
      setActiveTasksList(activeList);
      setCompletedTasksList(historyList);
      setActiveTasks(activeCount);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!volunteer) return;
    setToggleLoading(true);
    try {
      const updated = await updateVolunteer(user.uid, { is_available: !volunteer.is_available });
      setVolunteer(updated);
      showSuccess(`You are now ${updated.is_available ? 'Available' : 'Unavailable'}`);
    } catch (error) {
      console.error("Failed to toggle availability", error);
    } finally {
      setToggleLoading(false);
    }
  };

  const handleAcceptTask = async (task) => {
    setAcceptingTasks((prev) => ({ ...prev, [task.id]: true }));
    try {
      await volunteerAcceptTask(task.id);
      showSuccess("Task accepted! You can find it in 'Active Tasks'.");
      setRecommendations((prev) => prev.filter((t) => t.id !== task.id));
      setActiveTasks(prev => prev + 1);
      fetchData(); // Refresh to move task to active list
    } catch (error) {
      console.error("Failed to accept task", error);
    } finally {
      setAcceptingTasks((prev) => ({ ...prev, [task.id]: false }));
    }
  };

  const handleDismissTask = async (task) => {
    try {
      // Optimistically remove
      setRecommendations((prev) => prev.filter((t) => t.id !== task.id));
      await volunteerRejectTask(task.id);
    } catch (error) {
      console.error("Failed to dismiss task", error);
      // If it fails, refresh the data to correct state
      fetchData();
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      await volunteerCompleteTask(task.id);
      showSuccess("Excellent work! Task marked as completed.");
      setActiveTasksList((prev) => prev.filter((t) => t.id !== task.id));
      setActiveTasks((prev) => prev - 1);
      // Optimistically update tasks completed stat
      setVolunteer(prev => ({ ...prev, tasks_completed: (prev.tasks_completed || 0) + 1 }));
      fetchData();
    } catch (error) {
      console.error("Failed to complete task", error);
    }
  };

  const handleUpdateProfile = async (data) => {
    try {
      await updateVolunteer(user.uid, data);
      await fetchData();
    } catch (error) {
      console.error("Failed to update profile", error);
      throw error;
    }
  };

  if (loading || !volunteer) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader name={user?.name || ""} email={user?.email || ""} onEditProfile={() => setProfileDialogOpen(true)} />
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading dashboard...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader name={volunteer.name} email={volunteer.email} onEditProfile={() => setProfileDialogOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AvailabilityCard
            isAvailable={volunteer.is_available}
            onToggle={handleToggleAvailability}
            loading={toggleLoading}
          />
          <StatCard
            title="Tasks Completed"
            value={volunteer.tasks_completed || 0}
            icon={CheckCircleOutlineIcon}
            badgeText="Great job!"
            badgeBgColor="bg-emerald-100"
            badgeTextColor="text-emerald-500"
          />
          <StatCard
            title="Active Tasks"
            value={activeTasks}
            icon={AccessTimeIcon}
            iconBgColor="bg-blue-600"
            valueColor="text-blue-600"
            badgeText="Currently assigned"
            badgeBgColor="bg-blue-50"
            badgeTextColor="text-blue-500"
          />
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <div>
                <h3 className="text-blue-900 font-bold">Spotted a new need?</h3>
                <p className="text-blue-700 text-sm">Help the community by reporting a new survey or unmet need.</p>
            </div>
            <Button
                variant="contained"
                startIcon={<AddLocationAltIcon />}
                onClick={() => setAddSurveyOpen(true)}
                sx={{ 
                    bgcolor: '#2563eb', 
                    borderRadius: '12px',
                    px: 3,
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#1d4ed8' }
                }}
            >
                Add New Survey
            </Button>
        </div>

        {/* Active Tasks Section */}
        {activeTasksList.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 18 }} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Your Active Tasks</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {activeTasksList.map((task) => (
                <div key={task.id} className="h-full">
                  <ActiveTaskCard
                    task={task}
                    onComplete={handleCompleteTask}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Recommendations Section */}
        {recommendations.length > 0 ? (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                <AutoAwesomeIcon sx={{ fontSize: 18 }} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {recommendations.map((task) => (
                <div key={task.id} className="h-full">
                  <RecommendedTaskCard
                    task={task}
                    onAccept={handleAcceptTask}
                    onDismiss={handleDismissTask}
                    accepting={acceptingTasks[task.id]}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No new assignments</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You're all caught up! When a new task matches your skills and availability, it will appear here.
            </p>
          </section>
        )}

        {/* Completed History Section */}
        <section className="mb-8">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                <AccessTimeIcon sx={{ fontSize: 18 }} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Task History</h2>
            </div>

            {completedTasksList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                {completedTasksList.map((task) => (
                    <div key={task.id} className="h-full">
                    <CompletedTaskCard task={task} />
                    </div>
                ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
                    <p className="text-gray-400 text-sm italic">You haven't completed any tasks yet. Your impact history will appear here.</p>
                </div>
            )}
        </section>

        <AddSurveyDialog 
            open={addSurveyOpen} 
            onClose={() => setAddSurveyOpen(false)} 
            onSuccess={() => {
                showSuccess("Survey submitted successfully!");
                fetchData();
            }}
        />
      </main>

      <ProfileUpdateDialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        volunteer={volunteer}
        onUpdate={handleUpdateProfile}
      />
    </div>
  );
}
