import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';

import AuthLayout from './AuthLayout';
import { volunteerSignup } from '../../api/authApi';
import { signupVolunteer } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

export default function VolunteerSignupPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        location: '', phone: '', is_available: true,
    });
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setError('');
    };

    const addSkill = () => {
        const trimmed = skillInput.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills(prev => [...prev, trimmed]);
        }
        setSkillInput('');
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
    };

    const removeSkill = (skill) => setSkills(prev => prev.filter(s => s !== skill));

    const validate = () => {
        if (!form.name.trim()) return 'Full name is required.';
        if (!form.email.trim()) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email.';
        if (form.password.length < 8) return 'Password must be at least 8 characters.';
        if (form.password !== form.confirmPassword) return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setLoading(true);
        try {
            // 1. Create user in Firebase
            await signupVolunteer(form.email, form.password);

            // 2. Send additional profile data to backend
            // The Axios interceptor will automatically attach the new Firebase ID token
            await volunteerSignup({
                name: form.name,
                email: form.email,
                skills,
                location: form.location || null,
                phone: form.phone || null,
                is_available: form.is_available,
            });

            // AuthContext's onAuthStateChanged will detect the login and fetch user profile automatically
            navigate('/volunteer/dashboard', { replace: true });
        } catch (err) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join SevaSetu as a volunteer"
        >
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-4">
                {/* Name */}
                <TextField label="Full Name" name="name" value={form.name}
                    onChange={handleChange} fullWidth disabled={loading} sx={inputSx} />

                {/* Email */}
                <TextField label="Email" name="email" type="email" value={form.email}
                    onChange={handleChange} fullWidth disabled={loading} sx={inputSx} />

                {/* Password */}
                <TextField label="Password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password} onChange={handleChange}
                    fullWidth disabled={loading} sx={inputSx}
                    helperText="Minimum 8 characters"
                    InputProps={{ endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(p => !p)} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )}}
                />

                {/* Confirm Password */}
                <TextField label="Confirm Password" name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword} onChange={handleChange}
                    fullWidth disabled={loading} sx={inputSx}
                    InputProps={{ endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirm(p => !p)} edge="end">
                                {showConfirm ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )}}
                />

                {/* Skills Input */}
                <div>
                    <div className="flex gap-2">
                        <TextField label="Add Skill (press Enter)" value={skillInput}
                            onChange={e => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillKeyDown}
                            fullWidth disabled={loading} size="small"
                            sx={inputSx}
                        />
                        <IconButton onClick={addSkill} disabled={loading}
                            sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', px: 1.5 }}>
                            <AddIcon />
                        </IconButton>
                    </div>
                    {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {skills.map(s => (
                                <Chip key={s} label={s} onDelete={() => removeSkill(s)}
                                    size="small" sx={{ borderRadius: '8px' }} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Location */}
                <TextField label="Location (optional)" name="location" value={form.location}
                    onChange={handleChange} fullWidth disabled={loading} sx={inputSx} />

                {/* Phone */}
                <TextField label="Phone (optional)" name="phone" value={form.phone}
                    onChange={handleChange} fullWidth disabled={loading} sx={inputSx} />

                {/* Availability */}
                <FormControlLabel
                    control={
                        <Switch
                            name="is_available" checked={form.is_available}
                            onChange={handleChange} disabled={loading}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#10B981' },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10B981' },
                            }}
                        />
                    }
                    label={
                        <span className="text-sm font-medium text-gray-700">
                            Available for assignments
                        </span>
                    }
                />

                <Button type="submit" variant="contained" fullWidth disabled={loading}
                    sx={{
                        mt: 1, py: 1.5, borderRadius: '12px',
                        backgroundColor: '#2563EB', textTransform: 'none',
                        fontWeight: 700, fontSize: '15px',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                        '&:hover': { backgroundColor: '#1d4ed8' },
                    }}
                >
                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
                </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link to="/volunteer/login" className="text-blue-600 font-semibold hover:underline">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
}
