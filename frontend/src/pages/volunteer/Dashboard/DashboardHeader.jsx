import React, { useState, useEffect } from "react";
import Badge from "@mui/material/Badge";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import CircleIcon from '@mui/icons-material/Circle';
import { useAuth } from "../../../contexts/AuthContext";
import { getVolunteerNotifications, markNotificationRead, markAllNotificationsRead } from "../../../api/volunteerApi";

export default function DashboardHeader({ name, email, onEditProfile }) {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const fetchNotifications = async () => {
    try {
      const data = await getVolunteerNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling for demo
    return () => clearInterval(interval);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
        console.error(err);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
        console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Extract initials
  const getInitials = (nameStr) => {
    if (!nameStr) return "VL";
    const parts = nameStr.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white px-6 py-4 border-b border-gray-100 shadow-sm flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <img src="/sevasetu logo-bg-removed.svg" alt="SevaSetu" className="h-10 w-auto" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-none">SevaSetu</h1>
          <p className="text-sm text-gray-500">Volunteer Dashboard</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <IconButton
            onClick={logout}
            title="Sign Out"
            sx={{
              color: "#ef4444",
              "&:hover": { backgroundColor: "#fee2e2" },
            }}
          >
            <LogoutIcon />
          </IconButton>
          
          <IconButton
            onClick={handleClick}
            sx={{
              color: unreadCount > 0 ? "#2563eb" : "#6b7280",
              "&:hover": { backgroundColor: "#f3f4f6" },
            }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{
                "& .MuiBadge-badge": { backgroundColor: "#ef4444" },
              }}
            >
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                width: 360,
                maxHeight: 480,
                mt: 1.5,
                borderRadius: '16px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                '& .MuiList-root': { py: 0 }
              }
            }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 800 }}>Notifications</Typography>
              {unreadCount > 0 && (
                <Typography 
                  variant="caption" 
                  sx={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                  onClick={handleReadAll}
                >
                  Mark all as read
                </Typography>
              )}
            </Box>
            <Divider />
            <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <MenuItem 
                    key={n.id} 
                    onClick={() => handleMarkRead(n.id)}
                    sx={{ 
                      py: 1.5, 
                      px: 2, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-start',
                      whiteSpace: 'normal',
                      bgcolor: n.isRead ? 'transparent' : 'rgba(37, 99, 235, 0.04)',
                      '&:hover': { bgcolor: n.isRead ? 'rgba(0,0,0,0.02)' : 'rgba(37, 99, 235, 0.08)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: n.isRead ? 600 : 800, color: '#111827' }}>
                        {n.title}
                      </Typography>
                      {!n.isRead && <CircleIcon sx={{ fontSize: 8, color: '#2563eb' }} />}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#4b5563', fontSize: '0.8rem', mb: 1 }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </MenuItem>
                ))
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    No notifications yet
                  </Typography>
                </Box>
              )}
            </Box>
          </Menu>

        <div className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors" onClick={onEditProfile}>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-gray-800 leading-tight">{name}</p>
            <p className="text-xs text-gray-400">{email}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold tracking-wide">
            {getInitials(name)}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
