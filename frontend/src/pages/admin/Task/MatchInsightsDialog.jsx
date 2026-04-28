/**
 * MatchInsightsDialog.jsx
 *
 * Modal that shows the full ranked candidate list for a task,
 * with score breakdowns and explanations. "View All Matches" feature.
 *
 * Props:
 *   open     {boolean}
 *   onClose  {function}
 *   task     {object}  — task data
 */

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, CircularProgress, LinearProgress, Tooltip
} from '@mui/material';
import CloseIcon           from '@mui/icons-material/Close';
import IconButton          from '@mui/material/IconButton';
import AutoAwesomeIcon     from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon    from '@mui/icons-material/InfoOutlined';
import ElectricBoltIcon    from '@mui/icons-material/ElectricBolt';
import { getTaskMatches }  from '../../../api/taskApi';

// Score colour helpers
const scoreColor = (score) => {
    if (score >= 80) return { bar: '#10B981', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 60) return { bar: '#3B82F6', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (score >= 40) return { bar: '#F59E0B', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { bar: '#EF4444', badge: 'bg-red-50 text-red-700 border-red-200' };
};

const WEIGHT_LABELS = {
    skill_match:  'Skill Match',
    availability: 'Availability',
    performance:  'Performance',
    distance:     'Location',
};

function CandidateRow({ candidate, rank, isAssigned, onAssign, isAssigning }) {
    const [expanded, setExpanded] = useState(false);
    const col = scoreColor(candidate.match_score);

    return (
        <div className={`rounded-xl border p-3 mb-2 transition-all ${
            isAssigned ? 'border-emerald-200 bg-emerald-50/60' : 'border-gray-100 bg-white hover:border-blue-100'
        }`}>
            {/* Header row */}
            <div className="flex items-center gap-3">
                {/* Rank */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    rank === 1 ? 'bg-amber-400 text-white' :
                    rank === 2 ? 'bg-gray-300 text-gray-700' :
                    rank === 3 ? 'bg-orange-300 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                </div>

                {/* Name & skills */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900 truncate">{candidate.name}</p>
                        {isAssigned && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                                <CheckCircleIcon sx={{ fontSize: 10 }} /> ASSIGNED
                            </span>
                        )}
                        {candidate.emergency_mode && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                                <ElectricBoltIcon sx={{ fontSize: 10 }} /> EMERGENCY
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{candidate.location || '—'} · {candidate.active_tasks} active task(s)</p>
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-black px-2.5 py-1 rounded-lg border ${col.badge}`}>
                        {candidate.match_score}
                    </span>
                    
                    {!isAssigned && (
                        <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={() => onAssign?.(candidate)}
                            disabled={isAssigning}
                            sx={{ 
                                textTransform: 'none', 
                                fontSize: '11px', 
                                py: 0.5, 
                                borderRadius: '8px',
                                minWidth: '60px'
                            }}
                        >
                            {isAssigning ? <CircularProgress size={14} /> : 'Assign'}
                        </Button>
                    )}

                    <button onClick={() => setExpanded(e => !e)} className="text-gray-400 hover:text-blue-500 transition-colors">
                        <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                    </button>
                </div>
            </div>

            {/* Score bar */}
            <div className="mt-2 px-1">
                <LinearProgress
                    variant="determinate"
                    value={candidate.match_score}
                    sx={{
                        height: 4, borderRadius: 4,
                        backgroundColor: '#F3F4F6',
                        '& .MuiLinearProgress-bar': { backgroundColor: col.bar, borderRadius: 4 }
                    }}
                />
            </div>

            {/* Expanded breakdown */}
            {expanded && candidate.breakdown && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    {Object.entries(candidate.breakdown).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-500 w-24 shrink-0 font-medium">
                                {WEIGHT_LABELS[key] || key}
                            </span>
                            <div className="flex-1">
                                <LinearProgress
                                    variant="determinate"
                                    value={val.raw}
                                    sx={{
                                        height: 5, borderRadius: 4,
                                        backgroundColor: '#F3F4F6',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: scoreColor(val.raw).bar,
                                            borderRadius: 4
                                        }
                                    }}
                                />
                            </div>
                            <span className="text-[11px] font-bold text-gray-600 w-8 text-right shrink-0">{val.raw}</span>
                            <span className="text-[10px] text-blue-500 font-medium w-12 shrink-0 text-right">
                                ×{(val.weight * 100).toFixed(0)}%
                            </span>
                        </div>
                    ))}
                    {/* Explanation */}
                    <p className="text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-100 italic">
                        {candidate.breakdown.skill_match?.explanation}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function MatchInsightsDialog({ open, onClose, task, onAssign }) {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(false);
    const [assigningId, setAssigningId] = useState(null);
    const [error, setError]     = useState(null);

    const handleAssign = async (candidate) => {
        setAssigningId(candidate.volunteer_id);
        try {
            await onAssign?.(task, {
                volunteer_id: candidate.volunteer_id,
                volunteerName: candidate.name,
                matchPercent: candidate.match_score,
                subtitle: candidate.breakdown?.skill_match?.explanation || 'Direct assignment'
            });
            // Re-fetch to update state
            const updated = await getTaskMatches(task.id);
            setData(updated);
        } catch (e) {
            setError(e.message);
        } finally {
            setAssigningId(null);
        }
    };

    useEffect(() => {
        if (open && task?.id) {
            setLoading(true);
            setError(null);
            getTaskMatches(task.id)
                .then(setData)
                .catch(e => setError(e.message))
                .finally(() => setLoading(false));
        } else {
            setData(null);
        }
    }, [open, task?.id, task?.assignments?.length]);

    // Build a set of already-assigned volunteer IDs for highlighting
    const assignedIds = new Set((task?.assignments || []).map(a => a.volunteer_id));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3, maxHeight: '85vh' } }}>
            <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AutoAwesomeIcon sx={{ color: '#3B82F6' }} />
                        <span>Match Insights</span>
                    </div>
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </div>
                {task && (
                    <p className="text-sm font-normal text-gray-500 mt-0.5">
                        {task.title} · {task.priority} priority
                    </p>
                )}
            </DialogTitle>

            <DialogContent dividers sx={{ px: 2 }}>
                {/* Emergency mode banner */}
                {task?.priority === 'CRITICAL' && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">
                        <ElectricBoltIcon sx={{ color: '#EF4444', fontSize: 18 }} />
                        <div>
                            <p className="text-xs font-bold text-red-700">⚡ Emergency Mode Active</p>
                            <p className="text-[11px] text-red-500">Availability weighted at 35% · Distance penalty reduced</p>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center gap-3 py-10">
                        <CircularProgress size={32} />
                        <p className="text-sm text-gray-400">Ranking candidates…</p>
                    </div>
                )}

                {error && (
                    <div className="text-center py-8">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                )}

                {!loading && !error && data && (
                    <>
                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {[
                                { label: 'Candidates',  value: data.candidates?.length ?? 0 },
                                { label: 'Slots Needed', value: data.slots_needed },
                                { label: 'Assigned',    value: data.current_assignments },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
                                    <p className="text-xl font-black text-gray-800">{value}</p>
                                    <p className="text-[11px] text-gray-400 font-medium">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Candidate list */}
                        {data.candidates?.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 font-medium">No suitable volunteers found</p>
                                <p className="text-xs text-gray-400 mt-1">All volunteers may be unavailable or at capacity</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                                    Ranked by Match Score ↓
                                </p>
                                {data.candidates.map((c, i) => (
                                    <CandidateRow
                                        key={c.volunteer_id}
                                        candidate={c}
                                        rank={i + 1}
                                        isAssigned={assignedIds.has(c.volunteer_id)}
                                        onAssign={handleAssign}
                                        isAssigning={assigningId === c.volunteer_id}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {!loading && !error && !data && (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No data available.</p>
                    </div>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 2, py: 1.5 }}>
                <Button onClick={onClose} variant="contained" disableElevation
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700,
                          backgroundColor: '#1D4ED8', '&:hover': { backgroundColor: '#1e40af' } }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
