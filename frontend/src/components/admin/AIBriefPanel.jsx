import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, Chip, Skeleton, Fade, Stack } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';

export default function AIBriefPanel({ insights, loading }) {
    const [typedText, setTypedText] = useState("");
    const [fullText, setFullText] = useState("");

    useEffect(() => {
        if (insights && insights.global_status) {
            setFullText(insights.global_status);
            setTypedText("");
            let i = 0;
            const interval = setInterval(() => {
                setTypedText(insights.global_status.slice(0, i));
                i++;
                if (i > insights.global_status.length) clearInterval(interval);
            }, 30);
            return () => clearInterval(interval);
        }
    }, [insights]);

    if (!loading && (!insights || !insights.insights)) return null;

    return (
        <Card sx={{ 
            borderRadius: '24px', 
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            mb: 4,
            overflow: 'hidden'
        }}>
            <Box sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
                alignItems: 'center'
            }}>
                {/* Global Status Section */}
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box sx={{ 
                            width: 10, h: 10, borderRadius: '50%', bgcolor: '#10B981',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
                                '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)' },
                                '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }
                            }
                        }} />
                        <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#0369A1', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '11px' }}>
                            ✨ Live AI Commander Strategic Brief
                        </Typography>
                    </Box>
                    
                    {loading ? (
                        <Skeleton variant="text" width="80%" height={40} />
                    ) : (
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#1E293B', minHeight: '60px' }}>
                            {typedText}
                            <Box component="span" sx={{ 
                                display: 'inline-block', width: '2px', height: '1.2em', 
                                bgcolor: '#0369A1', ml: 0.5, verticalAlign: 'middle',
                                animation: 'blink 1s infinite',
                                '@keyframes blink': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0 } }
                            }} />
                        </Typography>
                    )}
                </Box>

                {/* Score Section */}
                <Box sx={{ 
                    textAlign: 'center', 
                    px: 4, 
                    borderLeft: { md: '1px solid #E2E8F0' },
                    borderRight: { md: '1px solid #E2E8F0' }
                }}>
                    <Typography variant="caption" fontWeight="800" color="text.secondary">OPERATION HEALTH</Typography>
                    <Typography variant="h3" fontWeight="900" sx={{ color: insights?.health_score > 70 ? '#10B981' : '#F59E0B' }}>
                        {loading ? '...' : `${insights?.health_score}%`}
                    </Typography>
                </Box>

                {/* Insights List */}
                <Box sx={{ flex: 1.5 }}>
                    <Stack spacing={1.5}>
                        {loading ? (
                            [1, 2].map(i => <Skeleton key={i} variant="rectangular" height={50} sx={{ borderRadius: '12px' }} />)
                        ) : (
                            insights?.insights.map((insight, i) => (
                                <Fade in timeout={500 + i * 200} key={i}>
                                    <Box sx={{ 
                                        p: 1.5, 
                                        borderRadius: '16px', 
                                        bgcolor: insight.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                                        border: '1px solid',
                                        borderColor: insight.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}>
                                        <Box sx={{ 
                                            p: 1, borderRadius: '10px', 
                                            bgcolor: insight.priority === 'HIGH' ? '#FEE2E2' : '#FEF3C7',
                                            color: insight.priority === 'HIGH' ? '#EF4444' : '#F59E0B'
                                        }}>
                                            {insight.priority === 'HIGH' ? <GppMaybeIcon fontSize="small" /> : <TrendingUpIcon fontSize="small" />}
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight="700" color="#1E293B">{insight.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">{insight.description}</Typography>
                                        </Box>
                                    </Box>
                                </Fade>
                            ))
                        )}
                    </Stack>
                </Box>
            </Box>
        </Card>
    );
}
