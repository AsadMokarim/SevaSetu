/**
 * scorer.js
 *
 * Weighted scoring engine with Emergency Mode (Phase 15).
 *
 * Standard weights:
 *   skill_match:  40%  availability: 20%  performance: 20%  distance: 20%
 *
 * Emergency (CRITICAL priority) weights:
 *   skill_match:  30%  availability: 35%  performance: 25%  distance: 10%
 *   → Prioritize who can respond NOW over who has ideal skills or location
 *
 * Partial skill match: 0 matching skills → score 10 (not 0)
 */

const STANDARD_WEIGHTS = {
    skill_match:  0.40,
    availability: 0.20,
    performance:  0.20,
    distance:     0.20,
};

const EMERGENCY_WEIGHTS = {
    skill_match:  0.30,   // Slightly reduced — urgency overrides specialization
    availability: 0.35,   // Most important: who can respond immediately
    performance:  0.25,   // Reliability matters more in emergencies
    distance:     0.10,   // Distance penalty reduced — need people NOW
};

// ─────────────────────────────────────────────────────────────────────────────
// SKILL NORMALIZATION
// ─────────────────────────────────────────────────────────────────────────────
const SKILL_SYNONYMS = {
    'doctor':       'medical',
    'physician':    'medical',
    'nurse':        'medical',
    'nursing':      'medical',
    'paramedic':    'medical',
    'emt':          'medical',
    'surgeon':      'medical',
    'first aid':    'first_aid',
    'cpr':          'cpr',
    'cook':         'food_handling',
    'chef':         'food_handling',
    'driver':       'driving',
    'transport':    'driving',
    'builder':      'construction',
    'carpenter':    'carpentry',
    'therapist':    'counseling',
    'psychologist': 'psychology',
    'mental health':'counseling'
};

const normalizeSkill = (skill) => {
    if (!skill) return '';
    let val = String(skill).toLowerCase().trim();
    
    // Exact map check first
    if (SKILL_SYNONYMS[val]) return SKILL_SYNONYMS[val];
    
    // Substring match for compound skills (e.g., "pediatric doctor" → "medical")
    for (const [synonym, mappedValue] of Object.entries(SKILL_SYNONYMS)) {
        if (val.includes(synonym)) return mappedValue;
    }
    
    return val;
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-SCORES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * skillMatchScore — allows partial match; 0 matches → 10 (not hard reject)
 */
const skillMatchScore = (volunteerSkills, taskRequiredSkills) => {
    if (!taskRequiredSkills || taskRequiredSkills.length === 0) {
        return { raw: 80, matched: [], explanation: 'No specific skills required' };
    }

    // Normalize both arrays
    const normalizedRequired = [...new Set(taskRequiredSkills.map(normalizeSkill).filter(Boolean))];
    const normalizedVolunteer = [...new Set(volunteerSkills.map(normalizeSkill).filter(Boolean))];

    // Non-strict substring matching
    const matched = normalizedRequired.filter(reqSkill => {
        return normalizedVolunteer.some(volSkill => 
            volSkill === reqSkill || 
            volSkill.includes(reqSkill) || 
            reqSkill.includes(volSkill)
        );
    });

    if (matched.length === 0) {
        return {
            raw: 10,
            matched: [],
            explanation: `No matching skills (volunteer has: ${volunteerSkills.join(', ') || 'none'})`
        };
    }
    const ratio = matched.length / normalizedRequired.length;
    const raw   = Math.max(30, Math.round(ratio * 100));
    return {
        raw,
        matched,
        explanation: `${matched.length}/${normalizedRequired.length} skills matched (${matched.join(', ')})`
    };
};

/**
 * availabilityScore — penalizes busy volunteers
 */
const availabilityScore = (volunteer, activeTaskCount = 0) => {
    const base    = volunteer.is_available ? 100 : 0;
    const penalty = activeTaskCount * 20;
    const raw     = Math.max(20, base - penalty);
    const explanation = activeTaskCount === 0
        ? 'Fully available, no active tasks'
        : `Available with ${activeTaskCount} active task(s)`;
    return { raw, explanation };
};

/**
 * performanceScore — defaults to 70 for new volunteers
 */
const performanceScore = (volunteer) => {
    const raw = (typeof volunteer.performance_score === 'number')
        ? Math.min(100, Math.max(0, volunteer.performance_score))
        : 70;
    return { raw, explanation: `Performance score: ${raw}/100` };
};

/**
 * distanceScore — city-level string comparison
 */
const distanceScore = (volunteer, task) => {
    const normalize = (loc = '') => loc.toLowerCase().trim().replace(/\s+/g, ' ');
    const volLoc  = normalize(volunteer.location);
    const taskLoc = normalize(task.location);

    if (!volLoc || !taskLoc) {
        return { raw: 50, explanation: 'Location data unavailable — neutral score' };
    }
    if (volLoc === taskLoc) {
        return { raw: 100, explanation: `Same city: ${task.location}` };
    }
    if (volLoc.includes(taskLoc) || taskLoc.includes(volLoc)) {
        return { raw: 75, explanation: `Nearby area: ${volunteer.location} ≈ ${task.location}` };
    }
    return { raw: 40, explanation: `Different city: ${volunteer.location} vs ${task.location}` };
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * computeMatchScore(volunteer, task, normalizedVolunteerSkills, activeTaskCount)
 *   → { total, breakdown, weights, emergencyMode }
 *
 * Automatically uses EMERGENCY_WEIGHTS when task.priority === 'CRITICAL'
 */
const computeMatchScore = (volunteer, task, normalizedVolunteerSkills = [], activeTaskCount = 0) => {
    const isEmergency = task.priority === 'CRITICAL';
    const weights     = isEmergency ? EMERGENCY_WEIGHTS : STANDARD_WEIGHTS;

    const skill  = skillMatchScore(normalizedVolunteerSkills, task.required_skills);
    const avail  = availabilityScore(volunteer, activeTaskCount);
    const perf   = performanceScore(volunteer);
    const dist   = distanceScore(volunteer, task);

    const total = parseFloat((
        skill.raw * weights.skill_match  +
        avail.raw * weights.availability +
        perf.raw  * weights.performance  +
        dist.raw  * weights.distance
    ).toFixed(2));

    return {
        total,
        emergencyMode: isEmergency,
        weights,
        breakdown: {
            skill_match:  { ...skill, weight: weights.skill_match  },
            availability: { ...avail, weight: weights.availability },
            performance:  { ...perf,  weight: weights.performance  },
            distance:     { ...dist,  weight: weights.distance     },
        }
    };
};

module.exports = { computeMatchScore, STANDARD_WEIGHTS, EMERGENCY_WEIGHTS };
