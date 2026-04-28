/**
 * taskGenerator.js
 *
 * Converts a raw survey into MULTIPLE task templates (Phase 12 upgrade).
 *
 * - Detects ALL matching categories in survey text (not just one)
 * - Generates 1 task per detected category (up to MAX_TASKS_PER_SURVEY)
 * - AI-enhanced when available; keyword fallback always works
 */

const MAX_TASKS_PER_SURVEY = 3;

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY → TASK TEMPLATES (Maps 1 category to an array of tasks)
// ─────────────────────────────────────────────────────────────────────────────
const TASK_TEMPLATES = {
    food:       [{ title: 'Food Distribution',               category: 'food',       required_skills: ['food_handling','logistics','driving'],         volunteers_per_task: 3 }],
    medical:    [
        { title: 'Medical Assistance',              category: 'medical',    required_skills: ['first_aid','medical','nursing','cpr'],          volunteers_per_task: 2 },
        { title: 'Patient/Crowd Management',        category: 'general',    required_skills: ['communication','general'],                      volunteers_per_task: 2 },
        { title: 'Medical Logistics Support',       category: 'logistics',  required_skills: ['logistics','driving','organization'],           volunteers_per_task: 1 }
    ],
    shelter:    [{ title: 'Shelter Setup & Management',      category: 'shelter',    required_skills: ['construction','logistics','carpentry'],         volunteers_per_task: 4 }],
    rescue:     [{ title: 'Search & Rescue Operations',      category: 'rescue',     required_skills: ['rescue','first_aid','swimming','climbing'],     volunteers_per_task: 5 }],
    hygiene:    [{ title: 'Sanitation & Hygiene Support',    category: 'hygiene',    required_skills: ['hygiene','health','logistics'],                 volunteers_per_task: 2 }],
    counseling: [{ title: 'Mental Health & Counseling',      category: 'counseling', required_skills: ['counseling','communication','psychology'],      volunteers_per_task: 1 }],
    logistics:  [{ title: 'Supply & Logistics Coordination', category: 'logistics',  required_skills: ['logistics','driving','organization'],          volunteers_per_task: 3 }],
    water:      [{ title: 'Water & Utilities Restoration',   category: 'water',      required_skills: ['plumbing','utilities','logistics'],            volunteers_per_task: 2 }],
    general:    [{ title: 'General Assistance',              category: 'general',    required_skills: ['general','communication'],                     volunteers_per_task: 2 }],
};

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD MAP — each entry scanned independently so multiple categories match
// ─────────────────────────────────────────────────────────────────────────────
const KEYWORD_MAP = [
    { keywords: ['food','meal','nutrition','hunger','ration','cook','distribute'],                                      category: 'food' },
    { keywords: ['medical','medicine','doctor','nurse','injury','health','hospital','sick','first aid','cpr','clinic'],  category: 'medical' },
    { keywords: ['shelter','housing','roof','camp','tent','accommodation','homeless','temporary housing'],              category: 'shelter' },
    { keywords: ['rescue','trapped','missing','search','flood','collapse','drown'],                                     category: 'rescue' },
    { keywords: ['sanitation','hygiene','toilet','clean','waste','sewage'],                                             category: 'hygiene' },
    { keywords: ['counsel','mental','trauma','stress','psychological','emotional'],                                     category: 'counseling' },
    { keywords: ['water','pipe','utility','electricity','power'],                                                       category: 'water' },
    { keywords: ['transport','logistics','supply','deliver','truck','vehicle','cargo'],                                  category: 'logistics' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const urgencyToPriority = (score) => {
    if (score >= 8) return 'CRITICAL';
    if (score >= 6) return 'HIGH';
    if (score >= 4) return 'MEDIUM';
    return 'LOW';
};

const detectUrgencyFromText = (text = '') => {
    const t = text.toLowerCase();
    if (/critical|emergency|urgent|immediate|life.threatening|danger/.test(t)) return 'CRITICAL';
    if (/serious|severe|high priority|injured|trapped/.test(t))                return 'HIGH';
    return 'MEDIUM';
};

/**
 * detectCategoriesFromAI — returns array of category keys from aiAnalysis.
 * AI may return a single category string or a comma-list.
 */
const detectCategoriesFromAI = (aiAnalysis) => {
    if (!aiAnalysis || !aiAnalysis.category) return [];
    const raw = aiAnalysis.category.toLowerCase();
    const detected = [];
    // Check if it's a comma-list (e.g. "food, medical")
    const parts = raw.split(',').map(s => s.trim());
    for (const part of parts) {
        if (TASK_TEMPLATES[part]) {
            detected.push(part);
        } else {
            // Partial match
            for (const key of Object.keys(TASK_TEMPLATES)) {
                if (part.includes(key) && !detected.includes(key)) detected.push(key);
            }
        }
    }
    return detected;
};

/**
 * detectAllCategoriesFromKeywords — scans text and returns ALL matching categories.
 * This is the key upgrade: instead of stopping at first match, we collect all.
 */
const detectAllCategoriesFromKeywords = (text = '') => {
    const lower = text.toLowerCase();
    const detected = [];
    for (const { keywords, category } of KEYWORD_MAP) {
        if (keywords.some(kw => lower.includes(kw)) && !detected.includes(category)) {
            detected.push(category);
        }
    }
    return detected.length > 0 ? detected : ['general'];
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
/**
 * generateTasksFromSurvey(survey) → Task Template[]
 *
 * Returns UP TO MAX_TASKS_PER_SURVEY task objects (not yet saved to Firestore).
 * Each task covers one need detected from the survey.
 */
const generateTasksFromSurvey = (survey) => {
    const combinedText = `${survey.title || ''} ${survey.description || ''} ${survey.raw_text || ''}`;

    // ── Detect all categories ────────────────────────────────────────────────
    const aiCategories      = detectCategoriesFromAI(survey.aiAnalysis);
    const keywordCategories = detectAllCategoriesFromKeywords(combinedText);

    // Merge: AI results first (higher trust), then keyword results
    let allCategories = [...new Set([...aiCategories, ...keywordCategories])];
    
    // Strict Context Awareness: Remove false-positive shelter in medical scenarios
    if (allCategories.includes('medical') && allCategories.includes('shelter')) {
        const t = combinedText.toLowerCase();
        // Only keep shelter if explicitly mentioned as a housing need
        if (!/homeless|temporary housing|evacuee|displaced|unhoused/.test(t)) {
            allCategories = allCategories.filter(c => c !== 'shelter');
        }
    }

    const categories    = allCategories.slice(0, MAX_TASKS_PER_SURVEY);
    const isAIEnhanced  = aiCategories.length > 0;

    // ── Priority (shared across all tasks from same survey) ──────────────────
    const priority = (survey.aiAnalysis && survey.aiAnalysis.urgencyScore != null)
        ? urgencyToPriority(survey.aiAnalysis.urgencyScore)
        : detectUrgencyFromText(combinedText);

    // ── Base description ─────────────────────────────────────────────────────
    const baseDescription = (survey.aiAnalysis && survey.aiAnalysis.summary)
        || survey.description
        || survey.raw_text
        || 'No description provided.';

    // ── Build tasks per category ──────────────────────────────────────────
    let tasks = categories.flatMap(category => {
        const templates = TASK_TEMPLATES[category] || TASK_TEMPLATES.general;
        return templates.map(template => {
            const totalVolunteers = (categories.length === 1 && templates.length === 1 && parseInt(survey.people_needed) > 0)
                ? parseInt(survey.people_needed)   // respect survey count for single-task surveys
                : template.volunteers_per_task;    // use template default for multi-task

            // Auto-calculate severity for tasks if not on survey
            let severity = survey.severity;
            if (!severity) {
                const pn = totalVolunteers;
                if (pn > 20) severity = 5;
                else if (pn > 10) severity = 3;
                else severity = 1;
                if (template.category === 'medical') severity = Math.min(5, severity + 2);
                else if (template.category === 'rescue') severity = Math.min(5, severity + 1);
            }

            return {
                surveyId:         survey.id,
                title:            template.title,
                description:      baseDescription,
                category:         template.category,
                required_skills:  template.required_skills,
                total_volunteers: totalVolunteers,
                location:         survey.location || '',
                area:             survey.area || survey.location || '',
                lat:              survey.lat || null,
                lng:              survey.lng || null,
                location_geo:     survey.location_geo || null,
                severity,
                priority,
                event_date:       survey.event_date || null,
                aiEnhanced:       isAIEnhanced,
                matchingStatus:   'pending'
            };
        });
    });

    // Enforce max 3 tasks overall per survey to avoid overwhelming volunteers
    tasks = tasks.slice(0, MAX_TASKS_PER_SURVEY);

    // Assign final indexing
    tasks = tasks.map((t, idx) => ({
        ...t,
        taskIndex: idx + 1,
        totalTasks: tasks.length
    }));

    console.log(`[TaskGenerator] Survey "${survey.id}" → ${tasks.length} task(s): [${categories.join(', ')}] | Priority: ${priority} | Source: ${isAIEnhanced ? 'AI' : 'Keyword'}`);
    return tasks;
};

module.exports = { generateTasksFromSurvey };
