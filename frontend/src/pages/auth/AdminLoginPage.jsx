import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

import AuthLayout from './AuthLayout';
import { loginVolunteer } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError('Both fields are required.');
            return;
        }
        setLoading(true);
        try {
            await loginVolunteer(form.email, form.password);
            // We don't call login(data) here because AuthContext handles it via onAuthStateChanged
            navigate('/admin/', { replace: true });
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Admin Login"
            subtitle="Access the SevaSetu admin dashboard"
        >
            <div className="flex items-center gap-2 mb-6 px-3 py-2.5 bg-blue-50 rounded-xl border border-blue-100">
                <AdminPanelSettingsOutlinedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                <span className="text-sm font-semibold text-blue-700">Admin Access Only</span>
            </div>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-4">
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    fullWidth
                    autoFocus
                    disabled={loading}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />

                <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(p => !p)} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                        mt: 1,
                        py: 1.5,
                        borderRadius: '12px',
                        backgroundColor: '#2563EB',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '15px',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                        '&:hover': { backgroundColor: '#1d4ed8' },
                    }}
                >
                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
                </Button>
            </form>
            <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-center text-sm text-gray-500">
                    Are you a volunteer?{' '}
                    <Link
                        to="/volunteer/login"
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Volunteer Portal
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
