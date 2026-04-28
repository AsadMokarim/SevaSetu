/**
 * assigner.js
 *
 * Greedy assignment logic + explainable match explanation generation.
 *
 * Picks top-N scored volunteers for a task.
 * Respects globalAssigned set to avoid assigning the same volunteer
 * to multiple tasks in the same pipeline run.
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXPLANATION GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * generateMatchExplanation(volunteer, task, breakdown) → string
 *
 * Builds a human-readable explanation for why this volunteer was assigned.
 * Shown in admin panel and volunteer dashboard.
 */
const generateMatchExplanation = (volunteer, task, breakdown) => {
    const parts = [];

    // Skill summary
    const skillInfo = breakdown.skill_match;
    if (skillInfo.matched && skillInfo.matched.length > 0) {
        parts.push(`${skillInfo.matched.length}/${task.required_skills.length} skills matched (${skillInfo.matched.join(', ')})`);
    } else {
        parts.push('General helper (no specific skill match)');
    }

    // Performance
    const perfScore = breakdown.performance.raw;
    if (perfScore >= 85)      parts.push(`Top performer (${perfScore}/100)`);
    else if (perfScore >= 70) parts.push(`Reliable volunteer (${perfScore}/100)`);
    else                      parts.push(`Performance: ${perfScore}/100`);

    // Location
    const distScore = breakdown.distance.raw;
    if (distScore >= 90)      parts.push('Local volunteer');
    else if (distScore >= 70) parts.push('Nearby area');
    else                      parts.push('Remote volunteer');

    // Workload
    const availScore = breakdown.availability.raw;
    if (availScore >= 90)     parts.push('Fully available');
    else if (availScore >= 60) parts.push('Partially available');
    else                      parts.push('Has active tasks');

    return parts.join(' · ');
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * assignVolunteersToTask(task, scoredVolunteers, globalAssigned)
 *   → Assignment[]
 *
 * @param task            - Task object (needs id, total_volunteers, required_skills)
 * @param scoredVolunteers - Array of { volunteer, total, breakdown } sorted desc by total
 * @param globalAssigned  - Set<volunteer_id> — volunteers used by OTHER tasks this run
 *
 * @returns Array of assignment objects ready to be written to the task document.
 */
const assignVolunteersToTask = (task, scoredVolunteers, globalAssigned = new Set()) => {
    const assignments = [];
    const needed = task.total_volunteers || 1;

    for (const scored of scoredVolunteers) {
        if (assignments.length >= needed) break;

        const vol   = scored.volunteer;
        const volId = vol.uid || vol.id;

        // Skip if already assigned to another task in this pipeline run
        if (globalAssigned.has(volId)) {
            console.log(`[Assigner] Skipping ${volId} — already assigned to another task`);
            continue;
        }

        const explanation = generateMatchExplanation(vol, task, scored.breakdown);

        assignments.push({
            volunteer_id:   volId,
            volunteer_name: vol.name || vol.email?.split('@')[0] || 'Unknown',
            status:         'assigned',
            score:          scored.total,
            matchedSkills:  scored.breakdown.skill_match.matched || [],
            explanation,
            assignedAt:     new Date().toISOString(),
        });

        // Mark as used so other tasks in this run won't pick the same person
        globalAssigned.add(volId);
    }

    console.log(`[Assigner] Task "${task.title}" → assigned ${assignments.length}/${needed} volunteer(s)`);
    return assignments;
};

module.exports = { assignVolunteersToTask, generateMatchExplanation };
