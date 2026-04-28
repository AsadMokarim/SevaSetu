import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('info'); // 'error', 'warning', 'info', 'success'

    const showNotification = useCallback((msg, sev = 'info') => {
        setMessage(msg);
        setSeverity(sev);
        setOpen(true);
    }, []);

    const showError = useCallback((msg) => {
        showNotification(msg, 'error');
    }, [showNotification]);

    const showSuccess = useCallback((msg) => {
        showNotification(msg, 'success');
    }, [showNotification]);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    return (
        <NotificationContext.Provider value={{ showNotification, showError, showSuccess }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleClose} 
                    severity={severity} 
                    variant="filled" 
                    sx={{ 
                        width: '100%', 
                        borderRadius: '12px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }}
                >
                    {message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
}

// Fallback for existing code
export const useError = useNotification;
