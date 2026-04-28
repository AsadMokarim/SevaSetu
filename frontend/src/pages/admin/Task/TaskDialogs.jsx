import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import { createTask, updateTask, deleteTask, assignTask } from '../../../api/taskApi';
import { useError } from '../../../contexts/ErrorContext';

export function AddTaskDialog({ open, onClose, onSuccess }) {
    const { showError, showSuccess } = useError();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', location: '', urgency: 'Medium', category: 'General', total_volunteers: 1
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await createTask({
                title: formData.title,
                description: formData.description,
                location: formData.location,
                priority: formData.urgency.toUpperCase(),
                category: formData.category,
                total_volunteers: parseInt(formData.total_volunteers, 10) || 1,
                surveyId: null // Manual tasks have no surveyId
            });
            showSuccess("Task created successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogContent dividers className="flex flex-col gap-4">
                <TextField label="Title" fullWidth size="small" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <TextField label="Description" fullWidth size="small" multiline rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                <TextField label="Location" fullWidth size="small" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                
                <FormControl size="small" fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select value={formData.category} label="Category" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        {['General', 'Food', 'Medical', 'Education', 'Rescue', 'Shelter', 'Community', 'Healthcare'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                    <InputLabel>Urgency</InputLabel>
                    <Select value={formData.urgency} label="Urgency" onChange={e => setFormData({ ...formData, urgency: e.target.value })}>
                        {['Low', 'Medium', 'High', 'Critical'].map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                    </Select>
                </FormControl>

                <TextField label="Volunteers Needed" type="number" fullWidth size="small" value={formData.total_volunteers} onChange={e => setFormData({ ...formData, total_volunteers: e.target.value })} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading || !formData.title || !formData.location}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Task'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function EditTaskDialog({ open, onClose, onSuccess, initialData }) {
    const { showError, showSuccess } = useError();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ 
        title: '', description: '', location: '', urgency: '', category: '', total_volunteers: 1, markIncomplete: false 
    });

    React.useEffect(() => {
        if (open && initialData) {
            // Helper to title-case strings (e.g., "HIGH" -> "High", "medical" -> "Medical")
            const titleCase = (str) => {
                if (!str) return '';
                return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            };

            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                location: initialData.location || '',
                urgency: titleCase(initialData.urgency || initialData.priority || 'Medium'),
                category: titleCase(initialData.category || 'General'),
                total_volunteers: initialData.total_volunteers || 1,
                markIncomplete: false
            });
        }
    }, [open, initialData]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const updateData = {
                title: formData.title,
                description: formData.description,
                location: formData.location,
                priority: formData.urgency.toUpperCase(),
                category: formData.category,
                total_volunteers: Number(formData.total_volunteers),
                markIncomplete: formData.markIncomplete
            };
            await updateTask(initialData.id, updateData);
            showSuccess("Task updated successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogContent dividers className="flex flex-col gap-4">
                <TextField label="Title" fullWidth size="small" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <TextField label="Description" fullWidth size="small" multiline rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                <div className="flex gap-4">
                    <TextField label="Location" fullWidth size="small" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    <TextField label="Total Volunteers" type="number" fullWidth size="small" value={formData.total_volunteers} onChange={e => setFormData({ ...formData, total_volunteers: e.target.value })} />
                </div>
                
                <FormControl size="small" fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select value={formData.category} label="Category" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        {['General', 'Food', 'Medical', 'Education', 'Rescue', 'Shelter', 'Community', 'Healthcare'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                    <InputLabel>Urgency</InputLabel>
                    <Select value={formData.urgency} label="Urgency" onChange={e => setFormData({ ...formData, urgency: e.target.value })}>
                        {['Low', 'Medium', 'High', 'Critical'].map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                    </Select>
                </FormControl>

                {(initialData?.status || '').toLowerCase() === 'completed' && (
                    <div className={`border rounded-lg p-3 mt-2 flex items-center justify-between transition-colors ${formData.markIncomplete ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                        <div>
                            <p className={`text-sm font-bold ${formData.markIncomplete ? 'text-amber-800' : 'text-emerald-800'}`}>
                                {formData.markIncomplete ? 'Will be marked Incomplete' : 'Task is Completed'}
                            </p>
                            <p className={`text-xs ${formData.markIncomplete ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {formData.markIncomplete ? 'Stats will be reverted on save.' : 'No changes to completion stats.'}
                            </p>
                        </div>
                        <Button 
                            variant={formData.markIncomplete ? "outlined" : "contained"}
                            color={formData.markIncomplete ? "warning" : "success"}
                            size="small"
                            onClick={() => setFormData(prev => ({ ...prev, markIncomplete: !prev.markIncomplete }))}
                            disableElevation
                        >
                            {formData.markIncomplete ? "Keep as Complete" : "Mark as Incomplete"}
                        </Button>
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading || !formData.title}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function DeleteTaskDialog({ open, onClose, onSuccess, task }) {
    const { showError, showSuccess } = useError();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!task) return;
        setLoading(true);
        try {
            await deleteTask(task.id);
            showSuccess("Task deleted successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => !loading && onClose()}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
                Are you sure you want to delete task "{task?.title}"? This action cannot be undone.
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function AIAssignConfirmDialog({ open, onClose, onSuccess, task, aiRecommendation }) {
    const { showError, showSuccess } = useError();
    const [loading, setLoading] = useState(false);

    const handleAssign = async () => {
        if (!task || !aiRecommendation || !aiRecommendation.volunteer_id) {
            // Note: Our previous implementation set volunteer_id inside aiRecommendation
            // We need to make sure volunteer_id is available. If it's just 'volunteerName', we might not have ID.
            // Let's assume aiRecommendation has volunteer_id if it's returning from the backend.
            if (!aiRecommendation.volunteer_id) {
                showError("Cannot assign: Volunteer ID missing from AI Recommendation.");
                return;
            }
        }
        setLoading(true);
        try {
            await assignTask(task.id, aiRecommendation.volunteer_id);
            showSuccess(`Successfully assigned ${aiRecommendation.volunteerName} to task!`);
            onSuccess();
            onClose();
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => !loading && onClose()}>
            <DialogTitle>Confirm AI Assignment</DialogTitle>
            <DialogContent>
                Assign <strong>{aiRecommendation?.volunteerName}</strong> to "{task?.title}"?
                <br /><br />
                <span className="text-sm text-gray-500">
                    Match Score: {aiRecommendation?.matchPercent}%<br />
                    Reason: {aiRecommendation?.subtitle}
                </span>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleAssign} color="primary" variant="contained" disabled={loading || !aiRecommendation?.volunteer_id}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Assign'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
