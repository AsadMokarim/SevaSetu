import React, { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import TaskFilterBar from "./TaskFilterBar";
import { AssignTaskDialog } from "./AssignTaskDialog";
import { AddTaskDialog, EditTaskDialog, DeleteTaskDialog, AIAssignConfirmDialog } from "./TaskDialogs";
import { getTasks, unassignTask, adminCompleteTask } from "../../../api/taskApi";
import { useError } from "../../../contexts/ErrorContext";

// Removed SAMPLE_TASKS to use real Firestore data exclusively.


export default function TaskPage() {
  const { showError } = useError();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "All Status", urgency: "All Urgency", category: "All Category" });

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignTaskData, setAssignTaskData] = useState(null);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTaskData, setEditTaskData] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTaskData, setDeleteTaskData] = useState(null);

  const [aiAssignDialogOpen, setAiAssignDialogOpen] = useState(false);
  const [aiAssignData, setAiAssignData] = useState(null);

  const fetchTasksData = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      const taskList = Array.isArray(data) ? data : (data?.tasks || []);
      
      const mappedData = taskList.map(t => ({
        ...t,
        id: t.id || t.uid,
        total_volunteers: t.total_volunteers || 0,
        date: t.event_date ? new Date(t.event_date).toISOString().split('T')[0] : 'N/A',
        // Keep assignments raw from backend (they now include score + explanation)
        assignments: t.assignments || [],
        aiRecommendation: Array.isArray(t.aiRecommendation) ? t.aiRecommendation[0] : t.aiRecommendation
      }));
      setTasks(mappedData);
    } catch (e) {
      showError("Failed to fetch tasks: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (task, volunteerId) => {
    try {
      await unassignTask(task.id, volunteerId);
      await fetchTasksData();
    } catch (e) {
      showError("Failed to unassign volunteer: " + e.message);
    }
  };

  const handleAdminComplete = async (task) => {
    if (!window.confirm(`Are you sure you want to mark "${task.title}" as completed? This will update all assigned volunteers' stats.`)) return;
    try {
      await adminCompleteTask(task.id);
      await fetchTasksData();
    } catch (e) {
      showError("Failed to complete task: " + e.message);
    }
  };

  // Initial load + auto-poll for 60s to catch async pipeline completions
  useEffect(() => {
    fetchTasksData();
    const interval = setInterval(fetchTasksData, 8000);
    const timeout  = setTimeout(() => clearInterval(interval), 60000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (filters.status !== "All Status" && task.status?.toLowerCase() !== filters.status.toLowerCase()) return false;
    // Support both task.priority (new) and task.urgency (legacy)
    const taskUrgency = (task.priority || task.urgency || '').toLowerCase();
    if (filters.urgency !== "All Urgency" && taskUrgency !== filters.urgency.toLowerCase()) return false;
    if (filters.category !== "All Category" && task.category?.toLowerCase() !== filters.category.toLowerCase()) return false;
    return true;
  });


  return (
    <div className="flex flex-col gap-4 mt-4 p-4 bg-gray-50 min-h-screen">
      <TaskFilterBar 
        totalCount={tasks.length} 
        filteredCount={filteredTasks.length} 
        onFilterChange={(f) => setFilters(f)}
        onAddTask={() => setAddDialogOpen(true)}
      />
      {filteredTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={(t) => { setEditTaskData(t); setEditDialogOpen(true); }}
          onDelete={(t) => { setDeleteTaskData(t); setDeleteDialogOpen(true); }}
          onAssignVolunteer={(t) => { setAssignTaskData(t); setAssignDialogOpen(true); }}
          onAIAssign={(t, rec) => { setAiAssignData({ task: t, recommendation: rec }); setAiAssignDialogOpen(true); }}
          onUnassign={handleUnassign}
          onAdminComplete={handleAdminComplete}
        />
      ))}
      
      <AssignTaskDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        task={assignTaskData}
        onSuccess={fetchTasksData}
      />

      <AddTaskDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={fetchTasksData}
      />

      <EditTaskDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        initialData={editTaskData}
        onSuccess={fetchTasksData}
      />

      <DeleteTaskDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        task={deleteTaskData}
        onSuccess={fetchTasksData}
      />

      <AIAssignConfirmDialog
        open={aiAssignDialogOpen}
        onClose={() => setAiAssignDialogOpen(false)}
        task={aiAssignData?.task}
        aiRecommendation={aiAssignData?.recommendation}
        onSuccess={fetchTasksData}
      />
    </div>
  );
}