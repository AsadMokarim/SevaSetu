import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, IconButton, Button, CircularProgress, 
    Divider, Chip, Tooltip, Stack, Avatar, AvatarGroup 
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WarningIcon from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { markNotificationAsRead, deleteNotification, assignFromNotification } from '../../api/notificationApi';

export default function NotificationPanel({ onCountChange }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const q = query(
            collection(db, 'notifications'),
            orderBy('created_at', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotifications(data);
            
            if (onCountChange) {
                const unreadCount = data.filter(n => !n.is_read).length;
                onCountChange(unreadCount);
            }
            setLoading(false);
        }, (error) => {
            console.error('Real-time notification error:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [onCountChange]);

    const handleMarkRead = async (id) => {
        try {
            await markNotificationAsRead(id);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleQuickAssign = async (notif, volunteerIds) => {
        setAssigningId(notif.id);
        try {
            await assignFromNotification({
                event_id: notif.event_id,
                volunteer_ids: volunteerIds,
                notification_id: notif.id
            });
        } catch (error) {
            console.error('Quick assign failed:', error);
        } finally {
            setAssigningId(null);
        }
    };

    const getTimeLeft = (eventDate) => {
        if (!eventDate) return null;
        const diff = new Date(eventDate) - new Date();
        if (diff < 0) return 'Event passed';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24) return `Starts in ${hours}h`;
        return `Starts in ${Math.floor(hours / 24)}d`;
    };

    if (loading) {
        return (
            <Box className="flex items-center justify-center p-8 w-96">
                <CircularProgress size={24} />
            </Box>
        );
    }

    return (
        <Box className="w-96 max-h-[600px] flex flex-col bg-white">
            <Box className="p-4 flex items-center justify-between bg-gray-50 border-b">
                <Typography variant="subtitle1" fontWeight="bold">Command Center Alerts</Typography>
                {notifications.filter(n => !n.is_read).length > 0 && (
                    <Chip size="small" label={`${notifications.filter(n => !n.is_read).length} New`} color="error" variant="filled" />
                )}
            </Box>

            <Box className="overflow-y-auto flex-1 custom-scrollbar">
                {notifications.length === 0 ? (
                    <Box className="p-12 text-center text-gray-400">
                        <NotificationsActiveIcon sx={{ fontSize: 48, mb: 2, opacity: 0.1 }} />
                        <Typography variant="body2">No active alerts</Typography>
                    </Box>
                ) : (
                    notifications.map((notif) => (
                        <Box 
                            key={notif.id} 
                            className={`p-4 border-b hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-amber-50/20' : ''}`}
                        >
                            {/* Header: Type and Time */}
                            <Box className="flex justify-between items-center mb-2">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip 
                                        label={notif.priority_level || 'MEDIUM'} 
                                        size="small" 
                                        color={notif.priority_level === 'CRITICAL' ? 'error' : notif.priority_level === 'HIGH' ? 'warning' : 'default'}
                                        sx={{ fontSize: '10px', height: '20px', fontWeight: 'bold' }}
                                    />
                                    {notif.status === 'ESCALATED' && (
                                        <Chip label="ESCALATED" size="small" variant="outlined" color="error" sx={{ fontSize: '9px', height: '18px' }} />
                                    )}
                                </Stack>
                                <Typography variant="caption" color="text.secondary" fontWeight="medium">
                                    {getTimeLeft(notif.event_date)}
                                </Typography>
                            </Box>

                            {/* Title and Message */}
                            <Typography variant="subtitle2" fontWeight="bold" color="text.primary" className="mb-1">
                                {notif.event_title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" className="block mb-2 italic">
                                "{notif.message}"
                            </Typography>

                            {/* Shortage Context */}
                            {notif.missing_roles?.length > 0 && (
                                <Box className="mb-3 p-2 bg-red-50 rounded border border-red-100">
                                    <Typography variant="caption" color="error.main" fontWeight="bold">
                                        Missing Roles: {notif.missing_roles.join(', ')}
                                    </Typography>
                                </Box>
                            )}

                            {/* Suggested Volunteers */}
                            {notif.suggested_volunteers?.length > 0 && notif.status !== 'RESOLVED' && (
                                <Box className="mb-3">
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" className="block mb-2">
                                        Suggested Matches:
                                    </Typography>
                                    <Stack spacing={1}>
                                        {notif.suggested_volunteers.map(vol => (
                                            <Box key={vol.id} className="flex items-center justify-between bg-white border rounded p-2 shadow-sm">
                                                <Box className="flex items-center gap-2">
                                                    <Avatar sx={{ width: 24, height: 24, fontSize: '10px', bgcolor: 'primary.light' }}>
                                                        {vol.name[0]}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '11px', fontWeight: 'bold' }}>{vol.name}</Typography>
                                                        <Typography sx={{ fontSize: '9px' }} color="text.secondary">{vol.skill} · {vol.distance}km</Typography>
                                                    </Box>
                                                </Box>
                                                <Button 
                                                    size="small" 
                                                    variant="text" 
                                                    onClick={() => handleQuickAssign(notif, [vol.id])}
                                                    disabled={assigningId === notif.id}
                                                    sx={{ fontSize: '10px', minWidth: 'unset', p: 0.5 }}
                                                >
                                                    Assign
                                                </Button>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                            {/* Actions */}
                            <Box className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <Stack direction="row" spacing={0.5}>
                                    {!notif.is_read && (
                                        <Tooltip title="Mark as Resolved">
                                            <IconButton size="small" color="success" onClick={() => handleMarkRead(notif.id)}>
                                                <DoneAllIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Delete Alert">
                                        <IconButton size="small" onClick={() => handleDelete(notif.id)}>
                                            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                                
                                <Button 
                                    size="small" 
                                    variant="contained" 
                                    disableElevation
                                    onClick={() => navigate(`/admin/tasks?search=${notif.event_id}`)}
                                    sx={{ fontSize: '10px', borderRadius: '6px' }}
                                >
                                    Full View
                                </Button>
                            </Box>
                        </Box>
                    ))
                )}
            </Box>

            {notifications.length > 0 && (
                <Box className="p-3 bg-gray-50 border-t text-center">
                    <Typography 
                        variant="caption" 
                        color="primary" 
                        fontWeight="bold"
                        className="cursor-pointer hover:underline uppercase tracking-wider"
                    >
                        Security Logs
                    </Typography>
                </Box>
            )}
        </Box>
    );
}