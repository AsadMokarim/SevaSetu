/**
 * matching/index.js
 *
 * Pipeline orchestrator — the ONLY public interface of the matching engine.
 * Called from surveyService.createSurvey() in a fire-and-forget pattern.
 *
 * Flow:
 *   1. Fetch survey from Firestore
 *   2. Generate task templates from survey
 *   3. Fetch all available volunteers (single DB call)
 *   4. Build active task count map (single DB call)
 *   5. For each task:
 *      a. Save task to Firestore
 *      b. Hard-filter volunteers
 *      c. Score remaining candidates
 *      d. Greedy assign top-N
 *      e. Write assignments into task document
 *   6. Mark survey as 'matched'
 */

const { db }                         = require('../../config/firebase');
const { generateTasksFromSurvey }    = require('./taskGenerator');
const { filterEligibleVolunteers, buildActiveTaskCountMap } = require('./matcher');
const { computeMatchScore }          = require('./scorer');
const { assignVolunteersToTask }     = require('./assigner');
const notificationService            = require('../notificationService');
const adminNotificationService       = require('../adminNotificationService');

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch the full survey document from Firestore.
 */
const getSurvey = async (surveyId) => {
    const doc = await db.collection('surveys').doc(surveyId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
};

/**
 * Fetch ALL available volunteers (no pagination — pipeline needs the full pool).
 * Returns empty array if none found.
 */
const getAllAvailableVolunteers = async () => {
    const snapshot = await db.collection('users')
        .where('role', '==', 'volunteer')
        .where('is_available', '==', true)
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Save a task template to Firestore and return the saved task with its ID.
 */
const createTaskInFirestore = async (template) => {
    const taskRef = db.collection('tasks').doc();
    const task = {
        id:          taskRef.id,
        assignments: [],
        status:      'open',
        createdAt:   new Date().toISOString(),
        updatedAt:   new Date().toISOString(),
        ...template,
    };
    await taskRef.set(task);
    console.log(`[Pipeline] Created task "${task.title}" (${taskRef.id})`);
    return task;
};

/**
 * Write final assignments array into an existing task document.
 */
const saveAssignmentsToTask = async (taskId, assignments) => {
    if (!assignments.length) return;
    await db.collection('tasks').doc(taskId).update({
        assignments,
        status:    'assigned',
        updatedAt: new Date().toISOString(),
    });
};

/**
 * Send push notifications to all assigned volunteers.
 */
const notifyAssignedVolunteers = (assignments, taskId, taskTitle) => {
    assignments.forEach(({ volunteer_id }) => {
        notificationService.sendNotificationToUser(
            volunteer_id,
            'New Task Assigned',
            `You've been matched to: ${taskTitle}. Please review and accept.`,
            { taskId }
        ).catch(err => console.error(`[Pipeline] Notification failed for ${volunteer_id}:`, err.message));
    });
};

/**
 * Trigger an admin notification if matching fails or is partial.
 */
const triggerAdminNotificationIfNeeded = async (task, assignmentsCount, missing_roles = [], suggested_volunteers = []) => {
    const required = task.total_volunteers || 1;
    if (assignmentsCount >= required) return;

    const type = assignmentsCount === 0 ? 'MATCH_FAIL' : 'PARTIAL_ASSIGNMENT';
    const message = `⚠️ ${task.title} - ${task.location || 'Remote'}: Required ${required}, Assigned ${assignmentsCount}. ${assignmentsCount === 0 ? 'No suitable volunteers found.' : 'Partially staffed.'}`;

    await adminNotificationService.createNotification({
        type,
        event_id: task.id,
        event_title: task.title,
        location: task.location || 'Remote',
        required_volunteers: required,
        assigned_volunteers: assignmentsCount,
        message,
        event_date: task.event_date || task.date,
        missing_roles,
        suggested_volunteers
    }).catch(err => console.error(`[Pipeline] Admin notification failed:`, err.message));
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * runPipeline(surveyId)
 *
 * Full matching pipeline. Called asynchronously — never awaited at call site.
 * Errors are caught and logged; they do NOT crash the main server process.
 */
const runPipeline = async (surveyId) => {
    console.log(`\n[Pipeline] ========== Starting for survey: ${surveyId} ==========`);

    try {
        // ── 1. Fetch survey ──────────────────────────────────────────────────
        const survey = await getSurvey(surveyId);
        if (!survey) {
            console.warn(`[Pipeline] Survey ${surveyId} not found. Aborting.`);
            return;
        }

        // ── 2. Generate task templates ────────────────────────────────────────
        const taskTemplates = generateTasksFromSurvey(survey);
        if (!taskTemplates.length) {
            console.warn(`[Pipeline] No tasks generated for survey ${surveyId}. Aborting.`);
            return;
        }

        // ── 3. Fetch available volunteer pool (one DB call) ──────────────────
        const allVolunteers = await getAllAvailableVolunteers();
        console.log(`[Pipeline] Available volunteer pool: ${allVolunteers.length}`);

        if (!allVolunteers.length) {
            // Still create the tasks, just without assignments
            for (const template of taskTemplates) {
                await createTaskInFirestore(template);
            }
            await db.collection('surveys').doc(surveyId).update({
                status:    'matched',
                updatedAt: new Date().toISOString(),
            });
            console.warn(`[Pipeline] No volunteers available. Tasks created but unassigned.`);
            return;
        }

        // ── 4. Pre-build active task count map (one DB call) ─────────────────
        const activeTaskCountMap = await buildActiveTaskCountMap(db);

        // ── 5. Global deduplication set ───────────────────────────────────────
        // Prevents the same volunteer being assigned to 2+ tasks in this run.
        const globalAssigned = new Set();

        // ── 6. Process each task template ─────────────────────────────────────
        for (const template of taskTemplates) {
            // a. Save task to Firestore
            const task = await createTaskInFirestore(template);

            // b. Hard filter
            const { eligible, normalizedSkillsMap } = filterEligibleVolunteers(
                task, allVolunteers, activeTaskCountMap
            );

            if (!eligible.length) {
                console.log(`[Pipeline] No eligible volunteers for task "${task.title}"`);
                await triggerAdminNotificationIfNeeded(task, 0);
                continue;
            }

            // c. Score all eligible volunteers
            const scored = eligible.map(vol => {
                const volId           = vol.uid || vol.id;
                const skills          = normalizedSkillsMap.get(volId) || [];
                const activeCount     = activeTaskCountMap.get(volId) || 0;
                const { total, breakdown } = computeMatchScore(vol, task, skills, activeCount);
                return { volunteer: vol, total, breakdown };
            }).sort((a, b) => b.total - a.total);   // best first

            console.log(`[Pipeline] Top candidates for "${task.title}":`,
                scored.slice(0, 5).map(s => `${s.volunteer.name || s.volunteer.id}(${s.total})`)
            );

            // d. Greedy assign top-N (respects globalAssigned)
            const assignments = assignVolunteersToTask(task, scored, globalAssigned);

            if (!assignments.length) {
                console.log(`[Pipeline] No assignments made for task "${task.title}"`);
                const suggested = scored.slice(0, 3).map(s => ({
                    id: s.volunteer.uid || s.volunteer.id,
                    name: s.volunteer.name || 'Unknown',
                    skill: s.breakdown.skill_match.matched[0] || 'General',
                    distance: s.breakdown.distance.raw
                }));
                await triggerAdminNotificationIfNeeded(task, 0, task.required_skills, suggested);
                continue;
            }

            // Check for partial assignment
            const missing_roles = (task.required_skills || []).filter(skill => 
                !assignments.some(a => (a.matchedSkills || []).includes(skill))
            );
            const suggested = scored
                .filter(s => !assignments.some(a => a.volunteer_id === (s.volunteer.uid || s.volunteer.id)))
                .slice(0, 3)
                .map(s => ({
                    id: s.volunteer.uid || s.volunteer.id,
                    name: s.volunteer.name || 'Unknown',
                    skill: s.breakdown.skill_match.matched[0] || 'General',
                    distance: s.breakdown.distance.raw
                }));

            await triggerAdminNotificationIfNeeded(task, assignments.length, missing_roles, suggested);

            // e. Persist assignments into task document
            await saveAssignmentsToTask(task.id, assignments);

            // f. Update active count map optimistically (for subsequent tasks)
            assignments.forEach(a => {
                const prev = activeTaskCountMap.get(a.volunteer_id) || 0;
                activeTaskCountMap.set(a.volunteer_id, prev + 1);
            });

            // g. Send notifications
            notifyAssignedVolunteers(assignments, task.id, task.title);
        }

        // ── 7. Mark survey as processed ──────────────────────────────────────
        await db.collection('surveys').doc(surveyId).update({
            status:    'matched',
            updatedAt: new Date().toISOString(),
        });

        console.log(`[Pipeline] ========== Completed for survey: ${surveyId} ==========\n`);

    } catch (err) {
        console.error(`[Pipeline] FATAL ERROR for survey ${surveyId}:`, err.message, err.stack);
        await db.collection('surveys').doc(surveyId).update({
            status:    'matching_failed',
            updatedAt: new Date().toISOString(),
        }).catch(() => {});
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// RE-MATCHING: Called when a volunteer rejects a task (Phase 14)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * runSingleTaskMatch(taskId, excludeVolunteerIds)
 *
 * Re-runs matching for a single existing task.
 * Used when a volunteer rejects an assignment — finds the next best candidate.
 *
 * @param {string}   taskId              - Existing task document ID
 * @param {string[]} excludeVolunteerIds - Volunteers to skip (rejected/completed)
 */
const runSingleTaskMatch = async (taskId, excludeVolunteerIds = []) => {
    console.log(`[Pipeline] Re-matching task ${taskId} (excluding: ${excludeVolunteerIds.join(', ') || 'none'})`);

    try {
        const taskDoc = await db.collection('tasks').doc(taskId).get();
        if (!taskDoc.exists) {
            console.warn(`[Pipeline] Re-match: task ${taskId} not found`);
            return;
        }
        const task = { id: taskDoc.id, ...taskDoc.data() };

        // Slots needed = total_volunteers minus currently active assignments
        const activeAssignments = (task.assignments || []).filter(
            a => a.status === 'assigned' || a.status === 'accepted'
        );
        const slotsNeeded = (task.total_volunteers || 1) - activeAssignments.length;

        if (slotsNeeded <= 0) {
            console.log(`[Pipeline] Re-match: task "${task.title}" already fully staffed`);
            return;
        }

        // Fetch available volunteers
        const allVolunteers = await getAllAvailableVolunteers();

        // Build exclude set: already assigned + explicitly excluded (rejected)
        const existingIds  = (task.assignments || []).map(a => a.volunteer_id);
        const excludeSet   = new Set([...existingIds, ...excludeVolunteerIds]);
        const candidates   = allVolunteers.filter(v => !excludeSet.has(v.uid || v.id));

        if (!candidates.length) {
            console.warn(`[Pipeline] Re-match: no candidates available for task "${task.title}"`);
            await triggerAdminNotificationIfNeeded(task, activeAssignments.length);
            return;
        }

        const activeTaskCountMap = await buildActiveTaskCountMap(db);
        const { eligible, normalizedSkillsMap } = filterEligibleVolunteers(task, candidates, activeTaskCountMap);

        if (!eligible.length) {
            console.warn(`[Pipeline] Re-match: no eligible volunteers for task "${task.title}"`);
            await triggerAdminNotificationIfNeeded(task, activeAssignments.length);
            return;
        }

        // Score + sort
        const scored = eligible.map(vol => {
            const volId      = vol.uid || vol.id;
            const skills     = normalizedSkillsMap.get(volId) || [];
            const count      = activeTaskCountMap.get(volId) || 0;
            const { total, breakdown, emergencyMode, weights } = computeMatchScore(vol, task, skills, count);
            return { volunteer: vol, total, breakdown, emergencyMode, weights };
        }).sort((a, b) => b.total - a.total);

        // Create a globalAssigned set with already-assigned volunteers so assigner respects them
        const globalAssigned = new Set(existingIds);

        // Override total_volunteers to only fill open slots
        const slottedTask   = { ...task, total_volunteers: slotsNeeded };
        const newAssignments = assignVolunteersToTask(slottedTask, scored, globalAssigned);

        if (!newAssignments.length) {
            console.warn(`[Pipeline] Re-match: no new assignments made for "${task.title}"`);
            await triggerAdminNotificationIfNeeded(task, activeAssignments.length);
            return;
        }

        // Check for partial filling
        const totalNow = activeAssignments.length + newAssignments.length;
        await triggerAdminNotificationIfNeeded(task, totalNow);

        // Merge with existing assignments
        const merged = [...(task.assignments || []), ...newAssignments];
        const newStatus = merged.some(a => a.status === 'assigned' || a.status === 'accepted') ? 'assigned' : 'open';

        await db.collection('tasks').doc(taskId).update({
            assignments: merged,
            status:      newStatus,
            updatedAt:   new Date().toISOString(),
        });

        // Notify newly assigned volunteers
        notifyAssignedVolunteers(newAssignments, taskId, task.title);

        console.log(`[Pipeline] Re-match complete: ${newAssignments.length} new volunteer(s) assigned to "${task.title}"`);

    } catch (err) {
        console.error(`[Pipeline] Re-match ERROR for task ${taskId}:`, err.message);
    }
};

module.exports = { runPipeline, runSingleTaskMatch };

