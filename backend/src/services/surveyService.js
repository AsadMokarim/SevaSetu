const { db, admin } = require('../config/firebase');
const matchingPipeline = require('./matching');

/**
 * Anti-Spam: Check if user has exceeded daily limit (2 surveys/day)
 */
const checkDailyLimit = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Fetch all surveys by this user and filter by date in memory 
    // to avoid needing a composite index for (createdBy + createdAt)
    const snapshot = await db.collection('surveys')
        .where('createdBy', '==', userId)
        .get();
    
    const todaySurveys = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.createdAt >= today.toISOString();
    });
    
    return todaySurveys.length < 2;
};

/**
 * Anti-Spam: Basic duplicate detection (similar title + location proximity)
 */
const checkDuplicate = async (title, lat, lng) => {
    if (!lat || !lng) return false;

    // Check surveys created in the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const snapshot = await db.collection('surveys')
        .where('createdAt', '>=', yesterday.toISOString())
        .get();

    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (!data.lat || !data.lng) continue;

        // Simple distance check (approx 500m)
        const dist = Math.sqrt(Math.pow(data.lat - lat, 2) + Math.pow(data.lng - lng, 2));
        const isNearby = dist < 0.005; 
        
        // Simple string match
        const isSimilarTitle = data.title.toLowerCase().includes(title.toLowerCase()) || 
                              title.toLowerCase().includes(data.title.toLowerCase());

        if (isNearby && isSimilarTitle) return true;
    }
    return false;
};

/**
 * Create a new survey with Decentralized Logic
 */
const createSurvey = async (surveyData, userId) => {
    // 1. Anti-Spam Checks
    const withinLimit = await checkDailyLimit(userId);
    if (!withinLimit) throw new Error('Daily survey limit exceeded (Max 2 per day)');

    const isDuplicate = await checkDuplicate(surveyData.title, parseFloat(surveyData.lat), parseFloat(surveyData.lng));
    if (isDuplicate) throw new Error('A similar survey was recently reported nearby');

    const surveyRef = db.collection('surveys').doc();
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data() || { performanceScore: 0 };

    // 2. Confidence Scoring
    // Formula: (perf / 100) * 0.6 + 0.4
    const perfScore = userData.performanceScore || 0;
    let confidenceScore = (perfScore / 100) * 0.6 + 0.4;
    
    let status = 'unverified';
    if (confidenceScore > 0.75) status = 'verified';
    else if (confidenceScore < 0.4) status = 'low_trust';

    const peopleNeeded = parseInt(surveyData.people_needed) || 1;
    
    // Dynamic Urgency Calculation
    let urgencyScore = 2; // Default Low
    if (peopleNeeded > 20) urgencyScore = 9;
    else if (peopleNeeded > 10) urgencyScore = 7;
    else if (peopleNeeded > 5) urgencyScore = 5;

    const fullText = (surveyData.title + ' ' + (surveyData.description || surveyData.raw_text || '')).toLowerCase();
    if (fullText.includes('urgent') || fullText.includes('emergency') || fullText.includes('blood') || fullText.includes('critical') || fullText.includes('rescue')) {
        urgencyScore += 3;
    }
    urgencyScore = Math.min(10, urgencyScore);

    const lat = surveyData.lat ? parseFloat(surveyData.lat) : null;
    const lng = surveyData.lng ? parseFloat(surveyData.lng) : null;

    const newSurvey = {
        id: surveyRef.id,
        createdBy: userId,
        title: surveyData.title || 'Untitled Survey',
        description: surveyData.description || surveyData.raw_text || '',
        raw_text: surveyData.raw_text || '',
        people_needed: peopleNeeded,
        event_date: surveyData.event_date || null,
        images: surveyData.images || [],
        location: surveyData.location || '',
        lat, lng,
        status,
        confidenceScore,
        confirmations: 0,
        rejections: 0,
        voters: [], 
        severity: Math.ceil(urgencyScore / 2),
        aiAnalysis: {
            urgencyScore,
            category: 'General'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await surveyRef.set(newSurvey);

    // 3. Update Volunteer Score (+1 for submission)
    await db.collection('users').doc(userId).update({
        performanceScore: admin.firestore.FieldValue.increment(1),
        totalSurveys: admin.firestore.FieldValue.increment(1)
    });

    // ── Pipeline (Matching logic) ──
    if (status === 'verified' || status === 'unverified') {
        matchingPipeline.runPipeline(surveyRef.id).catch(console.error);
    }

    return newSurvey;
};

/**
 * Crowd Verification System: Vote on Survey
 */
const voteOnSurvey = async (surveyId, userId, voteType) => {
    const surveyRef = db.collection('surveys').doc(surveyId);
    
    return await db.runTransaction(async (transaction) => {
        const surveyDoc = await transaction.get(surveyRef);
        if (!surveyDoc.exists) throw new Error('Survey not found');

        const survey = surveyDoc.data();
        if (survey.createdBy === userId) throw new Error('Cannot vote on your own survey');
        
        const voters = survey.voters || [];
        if (voters.some(v => v.userId === userId)) throw new Error('You have already voted on this survey');

        // Calculate score delta
        const scoreDelta = voteType === 'confirm' ? 0.1 : -0.15;
        let newScore = (survey.confidenceScore || 0.5) + scoreDelta;
        newScore = Math.max(0, Math.min(1, newScore));

        let newConfirmations = (survey.confirmations || 0) + (voteType === 'confirm' ? 1 : 0);
        let newRejections = (survey.rejections || 0) + (voteType === 'flag' ? 1 : 0);

        let newStatus = survey.status;
        if (newConfirmations >= 3 || newScore > 0.75) newStatus = 'verified';
        if (newRejections >= 3) newStatus = 'rejected';
        if (newScore < 0.4 && newStatus !== 'rejected') newStatus = 'low_trust';

        const newVoters = [...voters, { userId, voteType }];

        transaction.update(surveyRef, {
            confidenceScore: newScore,
            confirmations: newConfirmations,
            rejections: newRejections,
            status: newStatus,
            voters: newVoters,
            updatedAt: new Date().toISOString()
        });

        // Award points to the voter (+2 for participating)
        const voterRef = db.collection('users').doc(userId);
        transaction.update(voterRef, {
            performanceScore: admin.firestore.FieldValue.increment(2)
        });

        // If status changed to verified/rejected, update the creator's score
        if (newStatus !== survey.status) {
            const creatorRef = db.collection('users').doc(survey.createdBy);
            if (newStatus === 'verified') {
                transaction.update(creatorRef, { performanceScore: admin.firestore.FieldValue.increment(5) });
                // Also reward all "confirm" voters with extra points
                // (This would be done via a separate batch or cloud function for efficiency)
            } else if (newStatus === 'rejected') {
                transaction.update(creatorRef, { performanceScore: admin.firestore.FieldValue.increment(-10) });
            }
        }

        // 6. Notify creator of status change
        if (newStatus !== oldStatus) {
            const volunteerNotificationService = require('./volunteerNotificationService');
            volunteerNotificationService.createNotification(survey.createdBy, {
                title: 'Survey Status Updated',
                message: `Your report "${survey.title}" is now ${newStatus.toUpperCase()}.`,
                type: 'SURVEY_VERIFIED'
            }).catch(err => console.error('Notification failed:', err));
        }

        return { success: true, newStatus, newScore };
    });
};

const getAllSurveys = async (limit = 20, cursor = null) => {
    // Note: Combining 'where' with 'orderBy' requires a composite index in Firestore.
    // To avoid 500 errors during initial setup, we'll fetch sorted and filter in memory.
    let query = db.collection('surveys')
        .orderBy('createdAt', 'desc')
        .limit(parseInt(limit) * 2); // Fetch extra to account for filtered items

    if (cursor) {
        const startAfterDoc = await db.collection('surveys').doc(cursor).get();
        if (startAfterDoc.exists) query = query.startAfter(startAfterDoc);
    }

    const snapshot = await query.get();
    let surveys = snapshot.docs.map(doc => doc.data());
    
    // Filter out rejected surveys in memory to avoid needing a composite index
    // Include legacy statuses for backward compatibility
    const allowedStatuses = ['verified', 'unverified', 'low_trust', 'Active', 'Pending', 'matched', 'processed'];
    surveys = surveys.filter(s => allowedStatuses.includes(s.status))
                     .slice(0, parseInt(limit));

    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    return { surveys, nextCursor: lastVisible ? lastVisible.id : null };
};

const getSurveyById = async (surveyId) => {
    const doc = await db.collection('surveys').doc(surveyId).get();
    return doc.exists ? doc.data() : null;
};

const updateSurvey = async (surveyId, updateData) => {
    await db.collection('surveys').doc(surveyId).update({ ...updateData, updatedAt: new Date().toISOString() });
    return getSurveyById(surveyId);
};

const deleteSurvey = async (surveyId) => {
    await db.collection('surveys').doc(surveyId).delete();
    return true;
};

module.exports = {
    createSurvey,
    voteOnSurvey,
    getAllSurveys,
    getSurveyById,
    updateSurvey,
    deleteSurvey
};
