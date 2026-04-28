import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, List, ListItem, ListItemText, ListItemButton, TextField, InputAdornment, Checkbox, ListItemIcon, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getVolunteers } from '../../../api/volunteerApi';
import { assignTask } from '../../../api/taskApi';
import { useError } from '../../../contexts/ErrorContext';

export function AssignTaskDialog({ open, onClose, onSuccess, task }) {
    const { showError } = useError();
    const [loading, setLoading] = useState(false);
    const [volunteers, setVolunteers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [fetching, setFetching] = useState(false);

    const alreadyAssignedIds = task?.assignments?.map(a => a.volunteer_id) || [];

    useEffect(() => {
        if (open) {
            setSelectedIds([]);
            setSearchQuery('');
            fetchVolunteers();
        }
    }, [open]);

    const fetchVolunteers = async () => {
        setFetching(true);
        try {
            const data = await getVolunteers();
            setVolunteers(data);
        } catch (error) {
            console.error('Failed to fetch volunteers', error);
        } finally {
            setFetching(false);
        }
    };

    const handleToggle = (id) => {
        if (alreadyAssignedIds.includes(id)) return;
        
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleAssign = async () => {
        if (!task || selectedIds.length === 0) return;
        setLoading(true);
        try {
            // Using the new bulk assignment capability in the backend
            await assignTask(task.id, null, selectedIds);
            onSuccess();
            onClose();
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredVolunteers = volunteers.filter(v => {
        const nameMatch = v.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const skillsArray = Array.isArray(v.skills) ? v.skills : (typeof v.skills === 'string' ? v.skills.split(',').map(s => s.trim()) : []);
        const skillMatch = skillsArray.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
        return nameMatch || skillMatch;
    });

    return (
        <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle>Assign Volunteers to {task?.title}</DialogTitle>
            <DialogContent dividers>
                <div className="flex flex-col gap-3">
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search volunteers by name or skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'gray' }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    
                    {selectedIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                            <span className="text-xs font-bold text-gray-500 mr-1 self-center">Selected ({selectedIds.length}):</span>
                            {selectedIds.map(id => {
                                const v = volunteers.find(vol => vol.id === id);
                                return <Chip key={id} label={v?.name} size="small" onDelete={() => handleToggle(id)} color="primary" variant="outlined" />;
                            })}
                        </div>
                    )}
                </div>
                
                {fetching ? (
                    <div className="flex justify-center p-8"><CircularProgress /></div>
                ) : (
                    <div className="max-h-80 overflow-auto mt-2">
                        <List>
                            {filteredVolunteers.map(v => {
                                const isAssigned = alreadyAssignedIds.includes(v.id);
                                const isSelected = selectedIds.includes(v.id);
                                
                                return (
                                    <ListItem disablePadding key={v.id}>
                                        <ListItemButton 
                                            onClick={() => handleToggle(v.id)}
                                            disabled={isAssigned}
                                        >
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={isSelected || isAssigned}
                                                    disabled={isAssigned}
                                                    tabIndex={-1}
                                                    disableRipple
                                                />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={
                                                    <div className="flex items-center gap-2">
                                                        <span>{v.name}</span>
                                                        {isAssigned && <Chip label="Already Assigned" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />}
                                                    </div>
                                                }
                                                secondary={`${Array.isArray(v.skills) ? v.skills.join(', ') : (v.skills || 'No skills')} | Score: ${v.performance_score?.toFixed(1) || 0}`} 
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                            {filteredVolunteers.length === 0 && (
                                <p className="text-center py-8 text-gray-400 text-sm italic">
                                    No volunteers found matching "{searchQuery}"
                                </p>
                            )}
                        </List>
                    </div>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose} disabled={loading} color="inherit">Cancel</Button>
                <Button 
                    onClick={handleAssign} 
                    variant="contained" 
                    disabled={selectedIds.length === 0 || loading}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : `Assign ${selectedIds.length > 0 ? selectedIds.length : ''} Volunteer${selectedIds.length !== 1 ? 's' : ''}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
