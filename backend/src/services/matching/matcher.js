/**
 * matcher.js
 *
 * Hard filtering of volunteer candidates before scoring.
 *
 * Key design decisions (per user requirements):
 * - Skill mismatch does NOT hard-reject — it lowers the score instead.
 * - Only availability and workload cap are hard gates.
 * - Skills are normalized from comma-strings to arrays here.
 */

const MAX_ACTIVE_TASKS = 3;

// ─────────────────────────────────────────────────────────────────────────────
// SKILL NORMALIZATION
// Handles: "first_aid, medical" | ["first_aid"] | undefined
// Returns: lowercase array, trimmed
// ─────────────────────────────────────────────────────────────────────────────
const normalizeSkills = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) {
        return raw.map(s => String(s).toLowerCase().trim()).filter(Boolean);
    }
    if (typeof raw === 'string') {
        return raw.split(',').map(s => s.toLowerCase().trim()).filter(Boolean);
    }
    return [];
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE TASK COUNT MAP
// Single batch Firestore query to avoid N+1 reads per volunteer.
// Called once before filtering starts, passed in as a Map.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildActiveTaskCountMap(db) → Map<volunteer_id, count>
 *
 * Fetches all tasks with status 'assigned' or 'accepted',
 * counts how many active tasks each volunteer currently has.
 */
const buildActiveTaskCountMap = async (db) => {
    const snapshot = await db.collection('tasks')
        .where('status', 'in', ['assigned', 'accepted', 'open'])
        .get();

    const countMap = new Map();

    snapshot.forEach(doc => {
        const task = doc.data();
        const assignments = task.assignments || [];
        assignments.forEach(a => {
            if (a.status === 'assigned' || a.status === 'accepted') {
                const prev = countMap.get(a.volunteer_id) || 0;
                countMap.set(a.volunteer_id, prev + 1);
            }
        });
    });

    return countMap;
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * filterEligibleVolunteers(task, volunteers, activeTaskCountMap)
 *   → { eligible: volunteer[], normalized: Map<id, normalizedSkills[]> }
 *
 * Hard gates:
 *   1. is_available must be true
 *   2. Active task count must be < MAX_ACTIVE_TASKS (3)
 *
 * NOTE: Skill mismatch does NOT reject — it results in a low skill score.
 *
 * Also returns a `normalizedSkillsMap` to avoid re-normalizing during scoring.
 */
const filterEligibleVolunteers = (task, volunteers, activeTaskCountMap = new Map()) => {
    const normalizedSkillsMap = new Map();
    const eligible = [];

    for (const vol of volunteers) {
        const volId = vol.uid || vol.id;

        // ── Hard Gate 1: Availability ────────────────────────────────────────
        if (vol.is_available !== true) {
            continue;
        }

        // ── Hard Gate 2: Workload cap ────────────────────────────────────────
        const activeCount = activeTaskCountMap.get(volId) || 0;
        if (activeCount >= MAX_ACTIVE_TASKS) {
            console.log(`[Matcher] Skipping ${volId} — at workload cap (${activeCount} active tasks)`);
            continue;
        }

        // ── Normalize skills for this volunteer ──────────────────────────────
        const normalizedSkills = normalizeSkills(vol.skills);
        normalizedSkillsMap.set(volId, normalizedSkills);

        eligible.push(vol);
    }

    console.log(`[Matcher] ${eligible.length}/${volunteers.length} volunteers passed hard filter`);
    return { eligible, normalizedSkillsMap };
};

module.exports = {
    filterEligibleVolunteers,
    buildActiveTaskCountMap,
    normalizeSkills,
    MAX_ACTIVE_TASKS,
};
