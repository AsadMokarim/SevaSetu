import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';

export default function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <CircularProgress />
            </div>
        );
    }

    if (!isAuthenticated) {
        const loginPath = requiredRole === 'volunteer'
            ? '/volunteer/login'
            : '/admin/login';
        return <Navigate to={loginPath} replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        // If user has a role but it's the wrong one, redirect to their proper dashboard
        if (user?.role === 'admin') return <Navigate to="/admin/" replace />;
        if (user?.role === 'volunteer') return <Navigate to="/volunteer/dashboard" replace />;
        
        // If no role found (broken state), redirect to login
        return <Navigate to="/volunteer/login" replace />;
    }

    return children;
}
