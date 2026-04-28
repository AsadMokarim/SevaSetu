import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress } from '@mui/material';
import { addVolunteer, updateVolunteer, deleteVolunteer } from '../../../api/volunteerApi';
import { useError } from '../../../contexts/ErrorContext';

export function VolunteerFormDialog({ open, onClose, onSuccess, initialData }) {
    const { showError, showSuccess } = useError();
    const isEdit = !!initialData;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', location: '', skills: '' });

    useEffect(() => {
        if (open) {
            setFormData(initialData ? {
                name: initialData.name || '',
                email: initialData.email || '',
                location: initialData.location || '',
                skills: Array.isArray(initialData.skills) ? initialData.skills.join(', ') : (initialData.skills || '')
            } : { name: '', email: '', location: '', skills: '' });
        }
    }, [open, initialData]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const processedData = {
                ...formData,
                skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s !== "") : []
            };

            if (isEdit) {
                await updateVolunteer(initialData.id, processedData);
                showSuccess("Volunteer updated successfully!");
            } else {
                await addVolunteer(processedData);
                showSuccess("Volunteer added successfully!");
            }
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
            <DialogTitle>{isEdit ? 'Edit Volunteer' : 'Add Volunteer'}</DialogTitle>
            <DialogContent className="flex flex-col gap-4 mt-2">
                <TextField label="Name" fullWidth margin="dense" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <TextField label="Email" fullWidth margin="dense" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                <TextField label="Location" fullWidth margin="dense" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                <TextField label="Skills (comma separated)" fullWidth margin="dense" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function DeleteVolunteerDialog({ open, onClose, onSuccess, volunteer }) {
    const { showError, showSuccess } = useError();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!volunteer) return;
        setLoading(true);
        try {
            await deleteVolunteer(volunteer.id);
            showSuccess("Volunteer deleted successfully!");
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
                Are you sure you want to delete volunteer {volunteer?.name}? This action cannot be undone.
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
