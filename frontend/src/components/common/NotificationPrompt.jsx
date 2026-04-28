import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { requestPushPermission, onForegroundMessage } from '../../services/fcmClientService';

export default function NotificationPrompt() {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState(null);

    useEffect(() => {
        // Foreground message listener
        const unsubscribe = onForegroundMessage((payload) => {
            setMessage({
                title: payload.notification?.title || 'New Alert',
                body: payload.notification?.body || 'You have a new notification.'
            });
            setStatus('foreground_msg');
            setOpen(true);
        });

        // Only show permission prompt if permission hasn't been asked yet
        if ('Notification' in window && Notification.permission === 'default') {
            const timer = setTimeout(() => {
                setStatus('idle');
                setOpen(true);
            }, 3000);
            return () => {
                clearTimeout(timer);
                if (unsubscribe) unsubscribe();
            };
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const handleEnable = async () => {
        setStatus('loading');
        const success = await requestPushPermission();
        if (success) {
            setStatus('success');
            setTimeout(() => setOpen(false), 2000);
        } else {
            setStatus('error');
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Snackbar 
            open={open} 
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{ maxWidth: 400, mt: 2 }}
        >
            <Alert 
                severity={status === 'error' ? 'error' : status === 'success' ? 'success' : 'info'} 
                icon={status === 'success' ? undefined : <NotificationsActiveIcon />}
                onClose={handleClose}
                sx={{ 
                    width: '100%', 
                    boxShadow: 3, 
                    borderRadius: 2,
                    alignItems: 'center'
                }}
            >
                <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {status === 'foreground_msg' ? message?.title :
                         status === 'success' ? 'Notifications Enabled!' : 
                         status === 'error' ? 'Permission Denied' : 
                         'Enable Task Alerts'}
                    </Typography>
                    
                    {status === 'foreground_msg' && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                            {message?.body}
                        </Typography>
                    )}

                    {status === 'idle' && (
                        <Typography variant="caption" sx={{ display: 'block', mb: 1, mt: 0.5 }}>
                            Get instantly notified when you are assigned a disaster response task.
                        </Typography>
                    )}
                </Box>
                
                {status === 'idle' && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button 
                            size="small" 
                            variant="contained" 
                            color="primary" 
                            onClick={handleEnable}
                            disableElevation
                        >
                            Enable
                        </Button>
                        <Button 
                            size="small" 
                            variant="text" 
                            color="inherit" 
                            onClick={handleClose}
                        >
                            Later
                        </Button>
                    </Box>
                )}
            </Alert>
        </Snackbar>
    );
}
