import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

import {
    Box, Typography, CircularProgress, ToggleButton, ToggleButtonGroup,
    Chip, Select, MenuItem, FormControl, InputLabel, Button, Divider,
    Stack, IconButton, Tooltip
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import LayersIcon from '@mui/icons-material/Layers';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import useHeatmapData from '../../../hooks/useHeatmapData';

// ── Fix Leaflet default marker icon broken by Webpack/Vite ──────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CATEGORY_COLORS = {
    food: '#f59e0b',
    medical: '#ef4444',
    rescue: '#8b5cf6',
    shelter: '#3b82f6',
    general: '#6b7280',
};

const getSeverityColor = (weight) => {
    if (weight >= 50) return '#ef4444';
    if (weight >= 25) return '#f97316';
    if (weight >= 10) return '#eab308';
    return '#22c55e';
};

/**
 * MapController — auto-fits map bounds whenever rawPoints change.
 * Only pans/zooms if there is at least one valid point.
 * Runs inside <MapContainer> so it can access the Leaflet map instance.
 */
function MapController({ points }) {
    const map = useMap();
    const didFit = useRef(false);

    useEffect(() => {
        if (!points || points.length === 0) return;
        // Only auto-fit on first data load to avoid fighting user pan/zoom
        if (didFit.current) return;
        didFit.current = true;

        const bounds = points.map(p => [p.lat, p.lng]);
        try {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
            console.log('[Heatmap] MapController: fitBounds to', bounds.length, 'points');
        } catch (e) {
            console.warn('[Heatmap] MapController: fitBounds failed:', e.message);
        }
    }, [map, points]);

    return null;
}

// ── HeatLayer: stable leaflet.heat integration ──────────────────────────────
// Creates the layer ONCE on mount, then calls setLatLngs() on data changes.
// leaflet.heat API: setLatLngs(latlngs), addLatLng(latlng), redraw()
function HeatLayer({ points }) {
    const map = useMap();
    const layerRef = useRef(null);

    // Mount: create layer and add to map
    useEffect(() => {
        layerRef.current = L.heatLayer([], {
            radius: 30,
            blur: 20,
            maxZoom: 17,
            max: 100,
            minOpacity: 0.4,
            gradient: {
                0.1: '#22c55e',
                0.3: '#84cc16',
                0.5: '#eab308',
                0.7: '#f97316',
                1.0: '#ef4444',
            },
        });
        layerRef.current.addTo(map);
        console.log('[Heatmap] HeatLayer mounted and added to map');

        return () => {
            if (layerRef.current) {
                layerRef.current.remove();
                layerRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]); // mount/unmount only

    // Data sync: called whenever points array changes
    useEffect(() => {
        if (!layerRef.current) return;
        layerRef.current.setLatLngs(points || []);
        console.log('[Heatmap] HeatLayer.setLatLngs():', (points || []).length, 'pts | first:', points?.[0]);
    }, [points]);

    return null;
}

// ── Polygon zone overlay for high-density areas ────────────────────────────
function ZonePolygons({ aggregated, onSelect }) {
    return aggregated.map((ag, i) => {
        const r = 0.015 + (ag.weight / 3000);
        const pts = 8;
        const coords = Array.from({ length: pts }, (_, j) => [
            ag.lat + r * Math.sin((2 * Math.PI * j) / pts),
            ag.lng + r * Math.cos((2 * Math.PI * j) / pts),
        ]);
        const color = getSeverityColor(ag.weight);
        return (
            <Polygon
                key={`zone-${i}`}
                positions={coords}
                pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.2,
                    weight: 2,
                    opacity: 0.75,
                }}
                eventHandlers={{ click: () => onSelect(ag) }}
            />
        );
    });
}

// ── Area centroid markers with popup ──────────────────────────────────────
function AreaMarkers({ aggregated, categoryColors }) {
    return aggregated.map((ag, i) => {
        const color = getSeverityColor(ag.weight);
        const customIcon = L.divIcon({
            className: '',
            html: `<div style="
                width:14px; height:14px; border-radius:50%;
                background:${color}; border:2px solid white;
                box-shadow:0 0 6px ${color}88;
            "></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
        });

        return (
            <Marker key={`marker-${i}`} position={[ag.lat, ag.lng]} icon={customIcon}>
                <Popup maxWidth={260}>
                    <Box sx={{ minWidth: 200, fontFamily: 'inherit' }}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            📍 {ag.area || 'Unknown Area'}
                        </Typography>
                        <Chip
                            size="small"
                            label={`Weight: ${ag.weight.toFixed(0)}`}
                            sx={{ mb: 1, background: `${color}22`, color, border: `1px solid ${color}44`, fontSize: '0.65rem' }}
                        />
                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                            Need Breakdown
                        </Typography>
                        {Object.entries(ag.breakdown).map(([cat, count]) => count > 0 && (
                            <Stack key={cat} direction="row" justifyContent="space-between" alignItems="center" mb={0.3}>
                                <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{cat}</Typography>
                                <Chip size="small" label={count}
                                    sx={{ background: `${CATEGORY_COLORS[cat] || '#6b7280'}22`, color: CATEGORY_COLORS[cat] || '#6b7280', height: 16, fontSize: '0.6rem' }}
                                />
                            </Stack>
                        ))}
                        <Typography variant="caption" color="text.secondary" display="block" mt={0.5} mb={1}>
                            {ag.totalEvents} event{ag.totalEvents !== 1 ? 's' : ''}
                        </Typography>
                        <Divider sx={{ mb: 1 }} />
                        <Stack direction="row" spacing={0.5}>
                            <Button
                                size="small" variant="outlined"
                                startIcon={<OpenInNewIcon sx={{ fontSize: '0.75rem !important' }} />}
                                onClick={() => window.open(`/admin/task?location=${encodeURIComponent(ag.area)}`, '_blank')}
                                sx={{ flex: 1, fontSize: '0.65rem', py: 0.3 }}
                            >
                                View Events
                            </Button>
                            <Button
                                size="small" variant="contained"
                                onClick={() => window.open('/admin/volunteers', '_blank')}
                                sx={{ flex: 1, fontSize: '0.65rem', py: 0.3, background: '#287bff' }}
                            >
                                Assign
                            </Button>
                        </Stack>
                    </Box>
                </Popup>
            </Marker>
        );
    });
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function HeatmapPage() {
    const { rawPoints, aggregated, loading, error, useApiFallback } = useHeatmapData();

    const [viewMode, setViewMode] = useState('heatmap');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [showDebug, setShowDebug] = useState(true);

    // Apply filters to raw points
    const filteredPoints = rawPoints.filter(pt => {
        if (filterCategory !== 'all' && pt.category !== filterCategory) return false;
        if (filterSeverity !== 'all' && pt.severity < parseInt(filterSeverity)) return false;
        return true;
    });

    // Convert to leaflet.heat format: [lat, lng, intensity]
    const maxWeight = filteredPoints.reduce((m, p) => Math.max(m, p.weight), 1);
    const heatPoints = filteredPoints.map(p => [p.lat, p.lng, (p.weight / maxWeight) * 100]);

    // Pipeline debug trace
    console.log(`[Heatmap] render | rawPoints:${rawPoints.length} filtered:${filteredPoints.length} heatPoints:${heatPoints.length}`);
    if (rawPoints.length > 0) console.log('[Heatmap] Sample Raw Point:', rawPoints[0]);

    // Aggregated view after filters
    const filteredAggregated = aggregated.filter(ag => {
        if (filterCategory !== 'all') {
            if (!ag.breakdown[filterCategory] || ag.breakdown[filterCategory] === 0) return false;
        }
        return true;
    });

    if (loading) return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="calc(100vh - 56px)" gap={2}>
            <CircularProgress size={48} />
            <Typography color="text.secondary">Connecting to live data streams...</Typography>
            {error && <Typography variant="caption" color="error">Stream error: {error}</Typography>}
        </Box>
    );

    return (
        <Box sx={{ height: 'calc(100vh - 56px)', position: 'relative', overflow: 'hidden', background: '#f8fafc' }}>

            {/* ── Map ─────────────────────────────────────────────────────── */}
            <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ width: '100%', height: '100%' }}
                zoomControl={true}
            >
                {/* Light OpenStreetMap tile layer (Carto Voyager) */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    subdomains="abcd"
                    maxZoom={20}
                />

                {/* Auto-fit to data bounds on first load */}
                <MapController points={rawPoints} />

                {/* Heatmap Layer */}
                {viewMode === 'heatmap' && heatPoints.length > 0 && (
                    <HeatLayer points={heatPoints} />
                )}

                {/* Polygon Zones */}
                {viewMode === 'polygon' && (
                    <ZonePolygons aggregated={filteredAggregated} onSelect={() => {}} />
                )}

                {/* Centroid Markers with Popups — always visible */}
                {(viewMode === 'cluster' || viewMode === 'polygon' || filteredAggregated.length > 0) && (
                    <AreaMarkers aggregated={filteredAggregated} categoryColors={CATEGORY_COLORS} />
                )}
            </MapContainer>

            {/* ── Control Panel Overlay ────────────────────────────────────── */}
            <Box sx={{
                position: 'absolute', top: 16, left: 16, zIndex: 1000,
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 3, p: 2.5, minWidth: 280,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
                {/* Title */}
                <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                    <LocalFireDepartmentIcon sx={{ color: '#ef4444', fontSize: 28 }} />
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="white" lineHeight={1.2}>
                            Heatmap Analytics
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.5)">
                            Real-time · {filteredPoints.length} signals
                        </Typography>
                    </Box>
                    <Tooltip title="Data updates via live Firestore streams">
                        <Chip label="LIVE" size="small" sx={{
                            ml: 'auto !important', background: '#22c55e22', color: '#22c55e',
                            border: '1px solid #22c55e55', fontSize: '0.65rem', fontWeight: 700
                        }} />
                    </Tooltip>
                </Stack>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

                {/* View Toggle */}
                <Typography variant="caption" color="rgba(255,255,255,0.5)" mb={0.5} display="block">View Mode</Typography>
                <ToggleButtonGroup
                    value={viewMode} exclusive
                    onChange={(_, v) => v && setViewMode(v)}
                    size="small" fullWidth
                    sx={{
                        mb: 2,
                        '& .MuiToggleButton-root': {
                            color: 'rgba(255,255,255,0.6)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            fontSize: '0.7rem',
                            '&.Mui-selected': {
                                background: '#287bff33', color: '#60a5fa', borderColor: '#287bff55',
                            }
                        }
                    }}
                >
                    <ToggleButton value="heatmap">
                        <LocalFireDepartmentIcon sx={{ fontSize: 13, mr: 0.5 }} />Heat
                    </ToggleButton>
                    <ToggleButton value="cluster">
                        <BubbleChartIcon sx={{ fontSize: 13, mr: 0.5 }} />Markers
                    </ToggleButton>
                    <ToggleButton value="polygon">
                        <LayersIcon sx={{ fontSize: 13, mr: 0.5 }} />Zones
                    </ToggleButton>
                </ToggleButtonGroup>

                {/* Category Filter */}
                <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-focused': { color: '#60a5fa' } }}>
                        Category
                    </InputLabel>
                    <Select value={filterCategory} label="Category" onChange={e => setFilterCategory(e.target.value)}
                        sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' }, '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' } }}>
                        <MenuItem value="all">All Categories</MenuItem>
                        <MenuItem value="medical">🏥 Medical</MenuItem>
                        <MenuItem value="food">🍲 Food</MenuItem>
                        <MenuItem value="rescue">🚨 Rescue</MenuItem>
                        <MenuItem value="shelter">🏠 Shelter</MenuItem>
                        <MenuItem value="general">⚙️ General</MenuItem>
                    </Select>
                </FormControl>

                {/* Severity Filter */}
                <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-focused': { color: '#60a5fa' } }}>
                        Min Severity
                    </InputLabel>
                    <Select value={filterSeverity} label="Min Severity" onChange={e => setFilterSeverity(e.target.value)}
                        sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' }, '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' } }}>
                        <MenuItem value="all">All Severities</MenuItem>
                        <MenuItem value="3">Medium & Above (3+)</MenuItem>
                        <MenuItem value="4">High & Above (4+)</MenuItem>
                        <MenuItem value="5">Critical Only (5)</MenuItem>
                    </Select>
                </FormControl>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

                {/* Stats */}
                <Stack direction="row" spacing={1}>
                    <Box sx={{ flex: 1, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 2, p: 1.5, textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" color="#ef4444">
                            {filteredPoints.filter(p => p.severity >= 4).length}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.5)">Critical</Typography>
                    </Box>
                    <Box sx={{ flex: 1, background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 2, p: 1.5, textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" color="#eab308">
                            {filteredAggregated.length}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.5)">Areas</Typography>
                    </Box>
                    <Box sx={{ flex: 1, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 2, p: 1.5, textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" color="#22c55e">
                            {filteredPoints.filter(p => p.source === 'task').length}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.5)">Tasks</Typography>
                    </Box>
                </Stack>

                {error && (
                    <Typography variant="caption" color="error" mt={1} display="block">
                        ⚠ {error}
                    </Typography>
                )}
            </Box>

            {/* ── Heat Legend ──────────────────────────────────────────────── */}
            <Box sx={{
                position: 'absolute', bottom: 24, left: 16, zIndex: 1000,
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2, p: 1.5,
            }}>
                <Typography variant="caption" color="rgba(255,255,255,0.5)" mb={0.5} display="block">
                    Heat Intensity
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                    {['Low', 'Med', 'High', 'Critical'].map((label, i) => (
                        <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: ['#22c55e', '#eab308', '#f97316', '#ef4444'][i] }} />
                            <Typography variant="caption" color="rgba(255,255,255,0.5)" fontSize="0.6rem">
                                {label}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </Box>

            {/* ── Free tile badge ───────────────────────────────────────────── */}
            <Box sx={{
                position: 'absolute', bottom: 24, right: 16, zIndex: 1000,
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2, px: 1.5, py: 0.75,
            }}>
                <Typography variant="caption" color="rgba(255,255,255,0.4)" fontSize="0.6rem">
                    🗺 OpenStreetMap · No API key required
                </Typography>
            </Box>

            {/* ── Debug Status Overlay ────────────────────────────────────────── */}
            {showDebug && (
                <Box sx={{
                    position: 'absolute',
                    bottom: 20, right: 20,
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    borderRadius: 2, p: 2,
                    minWidth: 180
                }}>
                    <Stack spacing={1}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                            PIPELINE STATUS <IconButton size="small" onClick={() => setShowDebug(false)} sx={{ color: 'inherit', p: 0 }}>×</IconButton>
                        </Typography>
                        <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="#1e293b">Live Surveys</Typography>
                            <Chip size="small" label={rawPoints.filter(p => p.source === 'survey').length} sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#3b82f6', color: 'white' }} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="#1e293b">Active Tasks</Typography>
                            <Chip size="small" label={rawPoints.filter(p => p.source === 'task').length} sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#10b981', color: 'white' }} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="#1e293b">Unmet Needs</Typography>
                            <Chip size="small" label={rawPoints.filter(p => p.source === 'failure').length} sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#ef4444', color: 'white' }} />
                        </Box>
                        <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                        <Typography variant="caption" color={error ? "error" : "#64748b"}>
                            {error ? `Error: ${error.slice(0, 20)}...` : 
                             useApiFallback ? "Mode: API Fallback ☁️" : "Mode: Real-time ⚡"}
                        </Typography>
                    </Stack>
                </Box>
            )}

            {/* ── Empty state ───────────────────────────────────────────────── */}
            {heatPoints.length === 0 && !loading && (
                <Box sx={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    borderRadius: 3, p: 3,
                    textAlign: 'center',
                    pointerEvents: 'none',
                }}>
                    <LocalFireDepartmentIcon sx={{ fontSize: 40, color: 'rgba(0,0,0,0.1)', mb: 1 }} />
                    <Typography variant="body2" color="#1e293b">
                        No geo-tagged events yet
                    </Typography>
                    <Typography variant="caption" color="#64748b">
                        Add lat/lng when creating surveys to power the heatmap
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
