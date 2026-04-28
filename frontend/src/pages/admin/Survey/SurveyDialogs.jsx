import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Tabs, Tab, Box, Typography, Alert, Chip } from '@mui/material';
import { createSurvey, updateSurvey, deleteSurvey, extractFromFile, voteOnSurvey, geocodeLocation } from '../../../api/surveyApi';
import { useError } from '../../../contexts/ErrorContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import VisionIntake from '../../../components/admin/VisionIntake';

// Fix Leaflet marker icon (Vite/Webpack build bug)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * Inner component — captures click events from the Leaflet map
 * and calls onSelect with {lat, lng}.
 */
function LocationPicker({ onSelect, selected }) {
    useMapEvents({
        click(e) {
            onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
    });
    return selected
        ? <Marker position={[selected.lat, selected.lng]} />
        : null;
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export function AddSurveyDialog({ open, onClose, onSuccess }) {
    const { showError, showSuccess } = useError();
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [matching, setMatching] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [formData, setFormData] = useState({
        title: '', location: '', people_needed: 1, event_date: '', raw_text: '',
        lat: null, lng: null, area: ''
    });
    const [file, setFile] = useState(null);
    const [extracting, setExtracting] = useState(false);
    const [autofilledFields, setAutofilledFields] = useState(new Set());
    const [isHandwritten, setIsHandwritten] = useState(false);

    const handleAIAnalysis = (result) => {
        setFormData({
            ...formData,
            title: `AI Assist: ${result.category} Need`,
            raw_text: result.summary,
            location: result.location_hint || 'Pending Verification'
        });
        setAutofilledFields(new Set(['title', 'raw_text', 'location']));
        setTab(0);
    };

    const handleExtract = async () => {
        if (!file) return;
        setExtracting(true);
        try {
            const res = await extractFromFile(file);
            if (res.success) {
                const data = res.data;
                setFormData(f => ({
                    ...f,
                    title: data.title || f.title,
                    raw_text: data.description || f.raw_text,
                    location: data.formattedAddress || data.location || f.location,
                    people_needed: data.peopleNeeded || f.people_needed,
                    lat: data.lat || f.lat,
                    lng: data.lng || f.lng,
                    area: data.formattedAddress || f.area
                }));
                
                const fields = new Set(['title', 'raw_text', 'location', 'people_needed']);
                if (data.lat) fields.add('map');
                setAutofilledFields(fields);
                setIsHandwritten(data.isHandwritten);
                
                if (data.isHandwritten) {
                    showSuccess("✍️ Handwritten text detected. Please verify extracted data.");
                } else {
                    showSuccess("Data extracted successfully! Please verify.");
                }
                setTab(0);
            }
        } catch (error) {
            if (error.response?.data?.error_code === 'LOW_OCR_QUALITY') {
                const msg = error.response.data.isHandwritten 
                    ? "❌ Could not read handwritten text clearly."
                    : "❌ Could not read text clearly. Try a better image.";
                showError(msg);
            } else {
                showError("Extraction failed: " + (error.response?.data?.message || error.message));
            }
        } finally {
            setExtracting(false);
        }
    };

    // Geocoding — converts address text → lat/lng via backend unified service
    const handleGeocode = async () => {
        if (!formData.location.trim()) return;
        setGeocoding(true);
        try {
            const res = await geocodeLocation(formData.location);
            if (res.success && res.data.lat) {
                const { lat, lng, formattedAddress } = res.data;
                setFormData(f => ({
                    ...f,
                    lat,
                    lng,
                    area: formattedAddress.split(',').slice(0, 2).join(',').trim()
                }));
            } else {
                showError('Address not found. Try clicking on the map directly.');
            }
        } catch (err) {
            console.error('Geocoding error:', err);
            const msg = err.response?.data?.message || err.message || 'Geocoding failed';
            showError(`${msg}. Please click directly on the map.`);
        } finally {
            setGeocoding(false);
        }
    };

    const resetForm = () => {
        setFormData({ title: '', location: '', people_needed: 1, event_date: '', raw_text: '', lat: null, lng: null, area: '' });
        setFile(null);
        setTab(0);
        setMatching(false);
    };

    const handleClose = () => {
        if (!loading && !matching) {
            resetForm();
            onClose();
        }
    };

    const handleSubmit = async () => {
        // Validate lat/lng for manual entry
        if (tab === 0 && (!formData.lat || !formData.lng)) {
            showError('Please select a location on the map before submitting.');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            
            if (tab === 0) {
                data.append('title', formData.title);
                data.append('location', formData.location);
                data.append('people_needed', formData.people_needed);
                if (formData.event_date) data.append('event_date', formData.event_date);
                data.append('raw_text', formData.raw_text);
                // 🔥 Heatmap data: send lat/lng/area
                data.append('lat', formData.lat);
                data.append('lng', formData.lng);
                if (formData.area) data.append('area', formData.area);
            } else if (tab === 2) {
                if (!file) throw new Error("Please select a file to upload.");
                data.append('image', file);
                data.append('title', file.name || 'Uploaded Survey');
                data.append('location', 'Unknown');
                data.append('people_needed', 1);
                data.append('raw_text', `Uploaded image: ${file.name}`);
            } else if (tab === 1) {
                throw new Error("Please complete the AI analysis or switch to Manual Entry.");
            }

            await createSurvey(data);
            showSuccess("Survey submitted! Matching volunteers…");

            // Show matching animation for 5 seconds while pipeline runs in background
            setLoading(false);
            setMatching(true);
            setTimeout(() => {
                setMatching(false);
                onSuccess();
                resetForm();
                onClose();
            }, 5000);

        } catch (error) {
            showError(error.message);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800 }}>✨ Smart Survey Intake</DialogTitle>

            {/* Matching pipeline animation */}
            {matching ? (
                <DialogContent>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: 16 }}>
                        <CircularProgress size={48} sx={{ color: '#3B82F6' }} />
                        <p style={{ fontWeight: 800, fontSize: 16, color: '#1D4ED8', margin: 0 }}>
                            🤖 Matching Volunteers…
                        </p>
                        <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', margin: 0 }}>
                            The AI matching engine is analyzing skills, availability, and location
                            to find the best volunteers for each task.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 8 }}>
                            {['Generating tasks from survey…', 'Filtering eligible volunteers…', 'Computing match scores…', 'Assigning top candidates…'].map((step, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <CircularProgress size={12} sx={{ color: '#3B82F6' }} />
                                    <span style={{ fontSize: 12, color: '#4B5563' }}>{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            ) : (
                <DialogContent dividers>
                <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} variant="fullWidth">
                    <Tab label="Manual Entry" />
                    <Tab label="Visual AI" />
                    <Tab label="File Upload" />
                </Tabs>

                <TabPanel value={tab} index={0}>
                    <div className="flex flex-col gap-4">
                        <TextField 
                            label="Title" fullWidth size="small" required 
                            value={formData.title} 
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            sx={{ 
                                bgcolor: autofilledFields.has('title') ? 'rgba(59, 130, 246, 0.05)' : 'inherit',
                                borderRadius: 1
                            }}
                            InputProps={{
                                endAdornment: (
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        {isHandwritten && (
                                            <Chip label="Handwritten" size="small" color="secondary" variant="outlined" sx={{ height: 20, fontSize: '0.6rem' }} />
                                        )}
                                        {autofilledFields.has('title') && (
                                            <Chip label="Auto-filled" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.6rem' }} />
                                        )}
                                    </Box>
                                )
                            }}
                        />
                        
                        {/* Address + Geocode */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                            <TextField
                                label="Address / Location Name"
                                fullWidth size="small" required
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && handleGeocode()}
                                helperText="Type an address and click Search, or click on the map below"
                                sx={{ 
                                    bgcolor: autofilledFields.has('location') ? 'rgba(59, 130, 246, 0.05)' : 'inherit',
                                    borderRadius: 1
                                }}
                            />
                            <Button
                                variant="outlined" size="small"
                                onClick={handleGeocode}
                                disabled={geocoding || !formData.location.trim()}
                                sx={{ whiteSpace: 'nowrap', minWidth: 90, height: 40, mt: 0 }}
                            >
                                {geocoding ? <CircularProgress size={14} /> : '🔍 Search'}
                            </Button>
                        </Box>

                        {/* Map Picker */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                📍 Click on the map to pin the exact location
                            </Typography>
                            <Box sx={{ height: 260, borderRadius: 2, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                <MapContainer
                                    center={formData.lat ? [formData.lat, formData.lng] : [20.5937, 78.9629]}
                                    zoom={formData.lat ? 13 : 5}
                                    style={{ width: '100%', height: '100%' }}
                                    key={`picker-${formData.lat}-${formData.lng}`}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    />
                                    <LocationPicker
                                        selected={formData.lat ? { lat: formData.lat, lng: formData.lng } : null}
                                        onSelect={({ lat, lng }) => setFormData(f => ({ ...f, lat, lng }))}
                                    />
                                </MapContainer>
                            </Box>
                        </Box>

                        {/* Lat/Lng Confirmation */}
                        {formData.lat && formData.lng ? (
                            <Alert severity="success" sx={{ py: 0.5 }}>
                                ✅ Location pinned: {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}
                                {formData.area && ` — ${formData.area}`}
                            </Alert>
                        ) : (
                            <Alert severity="warning" sx={{ py: 0.5 }}>
                                ⚠ No location selected yet — search an address or click the map
                            </Alert>
                        )}

                        <TextField 
                            label="People Needed" type="number" fullWidth size="small" required 
                            value={formData.people_needed} 
                            onChange={e => setFormData({ ...formData, people_needed: e.target.value })}
                            sx={{ bgcolor: autofilledFields.has('people_needed') ? 'rgba(59, 130, 246, 0.05)' : 'inherit', borderRadius: 1 }}
                        />
                        <TextField label="Event Date" type="datetime-local" fullWidth size="small" InputLabelProps={{ shrink: true }} value={formData.event_date} onChange={e => setFormData({ ...formData, event_date: e.target.value })} />
                        <TextField 
                            label="Description / Raw Text" fullWidth size="small" multiline rows={3} required 
                            value={formData.raw_text} 
                            onChange={e => setFormData({ ...formData, raw_text: e.target.value })}
                            sx={{ bgcolor: autofilledFields.has('raw_text') ? 'rgba(59, 130, 246, 0.05)' : 'inherit', borderRadius: 1 }}
                        />
                    </div>
                </TabPanel>

                <TabPanel value={tab} index={1}>
                    <VisionIntake onAnalysisComplete={handleAIAnalysis} />
                </TabPanel>

                <TabPanel value={tab} index={2}>
                    <div className="flex flex-col gap-4 items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={{ display: 'none' }}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload">
                            <Button variant="outlined" component="span">
                                Select File
                            </Button>
                        </label>
                        {file && (
                            <div className="flex flex-col items-center gap-3 w-100">
                                <p className="text-sm text-gray-700 font-medium">📄 {file.name}</p>
                                <Button 
                                    variant="contained" 
                                    color="secondary"
                                    onClick={handleExtract}
                                    disabled={extracting}
                                    startIcon={extracting ? <CircularProgress size={20} /> : null}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {extracting ? 'Extracting...' : '✨ Extract from File'}
                                </Button>
                                <Button variant="text" size="small" onClick={() => setFile(null)}>Replace File</Button>
                            </div>
                        )}
                        {!file && <p className="text-sm text-gray-500 mt-2">Upload a scan or image of the survey.</p>}
                    </div>
                </TabPanel>
                </DialogContent>
            )}


            {!matching && (
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || (tab === 0 && (!formData.title || !formData.location || !formData.raw_text || !formData.lat || !formData.lng))}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
                </Button>
            </DialogActions>
            )}
        </Dialog>
    );
}

export function ViewSurveyDialog({ open, onClose, survey, onVoteSuccess }) {
    const { showError, showSuccess } = useError();
    const [voting, setVoting] = useState(false);

    if (!survey) return null;

    const handleVote = async (voteType) => {
        setVoting(true);
        try {
            await voteOnSurvey(survey.id, voteType);
            showSuccess(`Successfully ${voteType === 'confirm' ? 'confirmed' : 'flagged'} this report.`);
            onVoteSuccess?.();
        } catch (error) {
            showError(error.response?.data?.message || error.message);
        } finally {
            setVoting(false);
        }
    };

    const confidencePercent = Math.round((survey.confidenceScore || 0) * 100);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Survey Details</Typography>
                <Chip 
                    label={survey.status?.toUpperCase()} 
                    size="small" 
                    color={survey.status === 'verified' ? 'success' : survey.status === 'rejected' ? 'error' : 'warning'} 
                />
            </DialogTitle>
            <DialogContent dividers>
                <div className="flex flex-col gap-5">
                    {/* Trust Metrics Section */}
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                            Decentralized Trust Verification
                        </Typography>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex-1">
                                <Typography variant="body2" sx={{ color: '#475569', mb: 0.5 }}>Confidence Score</Typography>
                                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${confidencePercent > 75 ? 'bg-green-500' : confidencePercent > 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                        style={{ width: `${confidencePercent}%`, transition: 'width 0.5s ease' }} 
                                    />
                                </div>
                            </div>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>{confidencePercent}%</Typography>
                        </div>
                        <div className="flex gap-4 mt-3">
                            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>👍 {survey.confirmations || 0} Confirmations</Typography>
                            <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>⚠️ {survey.rejections || 0} Rejections</Typography>
                        </div>
                    </Box>

                    <div>
                        <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Title</p>
                        <p className="text-lg text-gray-900 font-bold leading-tight">{survey.title}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold uppercase">Location</p>
                            <p className="text-sm text-gray-800">{survey.location}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-semibold uppercase">People Needed</p>
                            <p className="text-sm text-gray-800">{survey.people_needed || 0} volunteers</p>
                        </div>
                    </div>

                    {survey.description && (
                        <div>
                            <p className="text-sm text-gray-500 font-semibold uppercase">Description</p>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-200 mt-1 italic">
                                "{survey.description}"
                            </p>
                        </div>
                    )}

                    {/* Crowd Actions */}
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>Verify this information:</Typography>
                        <div className="flex gap-3">
                            <Button 
                                variant="contained" 
                                color="success" 
                                startIcon={<Typography>👍</Typography>}
                                fullWidth
                                onClick={() => handleVote('confirm')}
                                disabled={voting}
                                sx={{ py: 1.2, fontWeight: 700, borderRadius: 2 }}
                            >
                                Confirm
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="error" 
                                startIcon={<Typography>⚠️</Typography>}
                                fullWidth
                                onClick={() => handleVote('flag')}
                                disabled={voting}
                                sx={{ py: 1.2, fontWeight: 700, borderRadius: 2 }}
                            >
                                Flag Incorrect
                            </Button>
                        </div>
                        <Typography variant="caption" sx={{ color: '#94a3b8', textAlign: 'center' }}>
                            Your vote affects the trust level and your own performance score.
                        </Typography>
                    </Box>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={{ color: '#64748b' }}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export function EditSurveyDialog({ open, onClose, onSuccess, initialData }) {
    const { showError, showSuccess } = useError();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ title: '', location: '', category: '', urgency: '' });

    React.useEffect(() => {
        if (open && initialData) {
            setFormData({
                title: initialData.title || '',
                location: initialData.location || '',
                category: initialData.category || '',
                urgency: initialData.urgency || ''
            });
        }
    }, [open, initialData]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await updateSurvey(initialData.id, formData);
            showSuccess("Survey updated successfully!");
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
            <DialogTitle>Edit Survey</DialogTitle>
            <DialogContent dividers className="flex flex-col gap-4 pt-4">
                <TextField label="Title" fullWidth size="small" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <TextField label="Location" fullWidth size="small" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                <TextField label="Category" fullWidth size="small" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                <TextField label="Urgency" fullWidth size="small" value={formData.urgency} onChange={e => setFormData({ ...formData, urgency: e.target.value })} />
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

export function DeleteSurveyDialog({ open, onClose, onSuccess, survey }) {
    const { showError, showSuccess } = useError();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!survey) return;
        setLoading(true);
        try {
            await deleteSurvey(survey.id);
            showSuccess("Survey deleted successfully!");
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
                Are you sure you want to delete the survey "{survey?.title}"? This action cannot be undone.
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
