import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider,
  Chip,
  CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { getVolunteerTasks } from "../../../api/volunteerApi";

export default function ViewVolunteerDialog({ open, onClose, volunteer }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && volunteer) {
      fetchHistory();
    }
  }, [open, volunteer]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getVolunteerTasks(volunteer.id);
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  if (!volunteer) return null;

  return (
    <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 3 }}>
        <Typography variant="h6" fontWeight="bold">Volunteer Profile</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <div className="flex flex-col md:flex-row h-[600px]">
          {/* Sidebar Info */}
          <div className="w-full md:w-80 bg-gray-50 border-r border-gray-100 p-6 flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-md`}>
              {volunteer.name ? volunteer.name.charAt(0) : '?'}
            </div>
            <Typography variant="h5" fontWeight="bold" textAlign="center">{volunteer.name}</Typography>
            <Chip 
              label={volunteer.available ? "Available Now" : "Currently Unavailable"} 
              size="small"
              color={volunteer.available ? "success" : "default"}
              sx={{ mt: 1, mb: 3, fontWeight: 600 }}
            />

            <Box className="w-full space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">{volunteer.location}</Typography>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <EmailOutlinedIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">{volunteer.email}</Typography>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <PhoneOutlinedIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">{volunteer.phone || "N/A"}</Typography>
              </div>
              <Divider />
              <div className="pt-2">
                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 1 }}>SKILLS</Typography>
                <Box className="flex flex-wrap gap-1.5">
                  {(Array.isArray(volunteer.skills) ? volunteer.skills : (typeof volunteer.skills === 'string' ? volunteer.skills.split(',').map(s => s.trim()) : [])).map(s => (
                    <Chip key={s} label={s} size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />
                  ))}
                </Box>
              </div>
            </Box>

            <Box className="mt-auto w-full pt-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-sm">
                  <Typography variant="h6" fontWeight="bold" color="teal">{volunteer.performanceScore || volunteer.performance_score || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Score</Typography>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-sm">
                  <Typography variant="h6" fontWeight="bold" color="teal">{volunteer.tasksCompleted || volunteer.tasks_completed || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Tasks</Typography>
                </div>
              </div>
            </Box>
          </div>

          {/* Task History Area */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <HistoryIcon sx={{ color: "text.secondary" }} />
              <Typography variant="h6" fontWeight="bold">Task History</Typography>
            </div>

            {loading ? (
              <Box className="flex-1 flex items-center justify-center">
                <CircularProgress size={32} />
              </Box>
            ) : tasks.length === 0 ? (
              <Box className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
                <HistoryIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography>No task history found</Typography>
              </Box>
            ) : (
              <Box className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {tasks.map(task => {
                  const assignment = task.assignments?.find(a => a.volunteer_id === volunteer.id);
                  const status = assignment?.status?.toUpperCase() || "UNKNOWN";
                  
                  return (
                    <div key={task.id} className="p-4 bg-white border border-gray-100 rounded-xl hover:border-teal-200 transition-colors shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <Typography fontWeight="bold" className="text-gray-800 line-clamp-1">{task.title}</Typography>
                        <Chip 
                          label={status} 
                          size="small" 
                          variant="filled"
                          color={status === 'COMPLETED' ? 'success' : (status === 'ACCEPTED' ? 'primary' : 'default')}
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                        />
                      </div>
                      <div className="flex gap-4 text-gray-500">
                        <div className="flex items-center gap-1">
                          <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption">{task.category}</Typography>
                        </div>
                        <div className="flex items-center gap-1">
                          <AccessTimeIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption">{new Date(task.event_date).toLocaleDateString()}</Typography>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Box>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
