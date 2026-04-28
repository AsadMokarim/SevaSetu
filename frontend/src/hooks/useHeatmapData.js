import { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const MAX_HEATMAP_POINTS = 300;

const getUrgencyBoost = (priority = '') => {
    const p = priority.toUpperCase();
    if (p === 'CRITICAL' || p === 'EMERGENCY') return 20;
    if (p === 'HIGH') return 10;
    return 0;
};

const computeWeight = (peopleNeeded = 1, severity = 1, priority = 'MEDIUM') => {
    return (peopleNeeded * 2) + (severity * 5) + getUrgencyBoost(priority);
};

const aggregateByArea = (points) => {
    const areaMap = new Map();
    for (const pt of points) {
        const areaKey = pt.area || `${pt.lat?.toFixed(3)},${pt.lng?.toFixed(3)}` || 'unknown';
        if (!pt.lat || !pt.lng) continue;
        if (!areaMap.has(areaKey)) {
            areaMap.set(areaKey, {
                area: pt.area || areaKey,
                lat: pt.lat,
                lng: pt.lng,
                weight: 0,
                breakdown: { food: 0, medical: 0, rescue: 0, shelter: 0, general: 0 },
                totalEvents: 0,
                titles: [],
            });
        }
        const entry = areaMap.get(areaKey);
        entry.weight += pt.weight;
        entry.totalEvents += 1;
        if (pt.title) entry.titles.push(pt.title);
        const cat = (pt.category || 'general').toLowerCase();
        if (entry.breakdown[cat] !== undefined) {
            entry.breakdown[cat] += pt.peopleNeeded || 1;
        } else {
            entry.breakdown.general += pt.peopleNeeded || 1;
        }
    }
    return Array.from(areaMap.values());
};

/**
 * Safely parse a lat or lng value from Firestore.
 * Handles numbers, numeric strings, and rejects nulls/NaN/zeros that
 * aren't actually coordinates (0,0 is in the ocean — still valid but rare).
 */
const parseCoord = (val) => {
    if (val === null || val === undefined || val === '') return null;
    const n = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(n)) return null;
    return n;
};

import apiClient from '../api/axiosConfig';

export default function useHeatmapData() {
    const [rawPoints, setRawPoints] = useState([]);
    const [aggregated, setAggregated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [useApiFallback, setUseApiFallback] = useState(false);

    const tasksRef = useRef([]);
    const surveysRef = useRef([]);
    const failuresRef = useRef([]);

    // Track which streams have fired at least once using a Set of indices
    const firedStreams = useRef(new Set());
    const TOTAL_STREAMS = 3;

    const processRawData = (data, source) => {
        return data.map(d => {
            const lat = parseCoord(d.lat);
            const lng = parseCoord(d.lng);
            if (lat === null || lng === null) return null;

            if (source === 'task') {
                return {
                    id: d.id, lat, lng,
                    area: d.area || d.location || '',
                    category: d.category || 'general',
                    title: d.title || 'Task',
                    peopleNeeded: d.total_volunteers || 1,
                    severity: d.severity || 1,
                    priority: d.priority || 'MEDIUM',
                    source: 'task',
                    weight: computeWeight(d.total_volunteers || 1, d.severity || 1, d.priority || 'MEDIUM'),
                };
            } else if (source === 'survey') {
                if (d.status === 'rejected') return null;

                let trustMultiplier = 1.0;
                if (d.status === 'unverified') trustMultiplier = 0.7;
                if (d.status === 'low_trust') trustMultiplier = 0.3;

                const baseWeight = computeWeight(d.people_needed || 1, d.severity || 1, d.urgency || 'MEDIUM');

                return {
                    id: d.id, lat, lng,
                    area: d.area || d.location || '',
                    category: d.category || 'general',
                    title: d.title || 'Survey',
                    peopleNeeded: d.people_needed || 1,
                    severity: d.severity || 1,
                    priority: d.urgency || 'MEDIUM',
                    status: d.status || 'unverified',
                    source: 'survey',
                    weight: baseWeight * trustMultiplier,
                };
            } else {
                return {
                    id: d.id, lat, lng,
                    area: d.area || d.location || '',
                    category: d.category || 'general',
                    title: d.message || 'Unmet Need',
                    peopleNeeded: d.people_needed || 5,
                    severity: 4,
                    priority: 'HIGH',
                    source: 'failure',
                    weight: computeWeight(d.people_needed || 5, 4, 'HIGH') + 10,
                };
            }
        }).filter(Boolean);
    };

    const merge = (streamIndex) => {
        // Record this stream as having fired
        if (streamIndex !== undefined) firedStreams.current.add(streamIndex);

        const all = [
            ...tasksRef.current,
            ...surveysRef.current,
            ...failuresRef.current,
        ];

        const capped = all
            .sort((a, b) => b.weight - a.weight)
            .slice(0, MAX_HEATMAP_POINTS);

        setRawPoints(capped);
        setAggregated(aggregateByArea(capped));

        // Resolve loading once all 3 streams have fired at least once
        if (firedStreams.current.size >= TOTAL_STREAMS) {
            setLoading(false);
        }
    };

    const fetchViaApi = async () => {
        try {
            console.log('[Heatmap] Fetching data via REST API fallback...');
            const res = await apiClient.get('/admin/heatmap');
            if (res.data.success) {
                const { tasks, surveys, failures } = res.data.data;
                tasksRef.current = processRawData(tasks, 'task');
                surveysRef.current = processRawData(surveys, 'survey');
                failuresRef.current = processRawData(failures, 'failure');
                firedStreams.current = new Set([0, 1, 2]);
                merge();
                setLoading(false);
            }
        } catch (err) {
            console.error('[Heatmap] API Fallback failed:', err);
            setError(`API Error: ${err.message}`);
        }
    };

    useEffect(() => {
        if (useApiFallback) {
            fetchViaApi();
            const interval = setInterval(fetchViaApi, 30000); // Poll every 30s as fallback
            return () => clearInterval(interval);
        }

        const unsubs = [];
        firedStreams.current = new Set();

        // Safety timeout — force-resolve if a stream never fires (e.g., no index)
        const timeout = setTimeout(() => {
            console.warn('[Heatmap] Safety timeout — forcing loading=false.');
            setLoading(false);
        }, 8000);

        const handleStreamError = (err, index) => {
            console.error(`[Heatmap] Stream ${index} error:`, err.code, err.message);
            if (err.code === 'permission-denied') {
                console.warn('[Heatmap] Permission denied! Switching to API fallback mode.');
                setUseApiFallback(true);
            } else {
                setError(err.message);
                merge(index);
            }
        };

        // ── Stream 0: Active Tasks ─────────────────────────────────────────
        const tasksQ = query(
            collection(db, 'tasks'),
            where('status', 'in', ['open', 'assigned', 'accepted'])
        );
        unsubs.push(
            onSnapshot(tasksQ, (snap) => {
                tasksRef.current = processRawData(snap.docs.map(d => ({ id: d.id, ...d.data() })), 'task');
                merge(0);
            }, (err) => handleStreamError(err, 0))
        );

        // ── Stream 1: Surveys ─────────────────────────────────────────────
        const surveysQ = query(collection(db, 'surveys'));
        unsubs.push(
            onSnapshot(surveysQ, (snap) => {
                const rawDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                console.log(`[Heatmap] Stream 1 (surveys) Snapshot: ${rawDocs.length} docs`);
                surveysRef.current = processRawData(rawDocs, 'survey');
                merge(1);
            }, (err) => handleStreamError(err, 1))
        );

        // ── Stream 2: Matching Failures ───────────────────────────────────
        const failQ = query(
            collection(db, 'admin_notifications'),
            where('type', 'in', ['MATCH_FAIL', 'PARTIAL_ASSIGNMENT']),
            where('is_read', '==', false)
        );
        unsubs.push(
            onSnapshot(failQ, (snap) => {
                failuresRef.current = processRawData(snap.docs.map(d => ({ id: d.id, ...d.data() })), 'failure');
                merge(2);
            }, (err) => handleStreamError(err, 2))
        );

        return () => {
            clearTimeout(timeout);
            unsubs.forEach(u => u());
        };
    }, [useApiFallback]);

    return { rawPoints, aggregated, loading, error, useApiFallback };
}
