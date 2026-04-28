import React, { useState } from 'react';
import { 
    Box, Button, Card, CardContent, Typography, 
    CircularProgress, Chip, List, ListItem, 
    ListItemIcon, ListItemText, Divider 
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import apiClient from '../../api/axiosConfig';

export default function VisionIntake({ onAnalysisComplete }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImagePreview(URL.createObjectURL(file));
        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await apiClient.post('/surveys/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const data = response.data.data || response.data;
            setResult(data);
            if (onAnalysisComplete) onAnalysisComplete(data);
        } catch (error) {
            console.error("Vision analysis failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{ borderRadius: '24px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <Box sx={{ p: 3, background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AutoAwesomeIcon sx={{ color: '#0284C7' }} />
                    <Typography variant="h6" fontWeight="800" sx={{ color: '#0C4A6E' }}>
                        ✨ AI Visual Intake
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Upload a photo of the disaster scene for instant actionable intelligence.
                </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
                {!imagePreview ? (
                    <Button
                        component="label"
                        variant="dashed"
                        fullWidth
                        sx={{
                            height: '160px',
                            border: '2px dashed #CBD5E1',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            textTransform: 'none',
                            '&:hover': { border: '2px dashed #0284C7', bgcolor: '#F8FAFC' }
                        }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 40, color: '#94A3B8' }} />
                        <Typography fontWeight="600" color="#64748B">Click to upload or drag image</Typography>
                        <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                    </Button>
                ) : (
                    <Box sx={{ position: 'relative' }}>
                        <img 
                            src={imagePreview} 
                            alt="Preview" 
                            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }} 
                        />
                        {loading && (
                            <Box sx={{ 
                                position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.7)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '12px'
                            }}>
                                <CircularProgress size={30} thickness={5} />
                                <Typography sx={{ ml: 2, fontWeight: 700 }}>AI is analyzing...</Typography>
                            </Box>
                        )}
                        {!loading && (
                            <Button 
                                size="small" 
                                sx={{ mt: 1 }} 
                                onClick={() => setImagePreview(null)}
                            >
                                Change Image
                            </Button>
                        )}
                    </Box>
                )}

                {result && (
                    <Box sx={{ mt: 4, animation: 'fadeIn 0.5s ease-out' }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip label={result.category} color="primary" size="small" sx={{ fontWeight: 700 }} />
                            <Chip 
                                label={result.urgency} 
                                color={result.urgency === 'HIGH' ? 'error' : 'warning'} 
                                size="small" 
                                sx={{ fontWeight: 700 }} 
                                icon={<WarningAmberIcon />}
                            />
                        </Box>
                        
                        <Typography variant="body1" fontWeight="600" sx={{ mb: 2, color: '#1E293B' }}>
                            {result.summary}
                        </Typography>

                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Actionable Tasks
                        </Typography>
                        
                        <List disablePadding>
                            {result.suggested_tasks.map((task, i) => (
                                <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                        <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#10B981' }} />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={task.title} 
                                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
