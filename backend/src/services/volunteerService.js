const { db } = require('../config/firebase');

/**
 * Get all volunteers with pagination
 */
const getAllVolunteers = async (limit = 100, cursor = null) => {
    // Note: To truly filter by role='volunteer', we need a composite index if combining with orderBy.
    // For simplicity without manual index creation, we'll query by role and let Firestore handle it,
    // or just fetch all and filter if it's a small dataset, but querying by role is better.
    let query = db.collection('users')
                  .where('role', '==', 'volunteer')
                  .limit(parseInt(limit));

    if (cursor) {
        const startAfterDoc = await db.collection('users').doc(cursor).get();
        if (startAfterDoc.exists) {
            query = query.startAfter(startAfterDoc);
        }
    }

    const snapshot = await query.get();
    const volunteers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const nextCursor = lastVisible ? lastVisible.id : null;

    return { volunteers, nextCursor };
};

/**
 * Get volunteer by ID
 */
const getVolunteerById = async (volunteerId) => {
    const doc = await db.collection('users').doc(volunteerId).get();
    if (!doc.exists) return null;
    
    const data = doc.data();
    if (data.role !== 'volunteer') return null; // Ensure we only return volunteers
    
    return { id: doc.id, ...data };
};

/**
 * Update volunteer profile
 */
const updateVolunteer = async (volunteerId, updateData) => {
    const docRef = db.collection('users').doc(volunteerId);
    const doc = await docRef.get();
    
    if (!doc.exists || doc.data().role !== 'volunteer') return null;

    // Prevent changing role via this endpoint
    delete updateData.role;
    delete updateData.uid;

    const updatedData = {
        ...updateData,
        updatedAt: new Date().toISOString()
    };

    await docRef.update(updatedData);
    return { ...doc.data(), ...updatedData };
};

/**
 * Delete volunteer (or simply deactivate)
 */
const deleteVolunteer = async (volunteerId) => {
    const docRef = db.collection('users').doc(volunteerId);
    const doc = await docRef.get();
    
    if (!doc.exists || doc.data().role !== 'volunteer') return false;

    // Ideally, we might just set an 'isActive: false' flag, but as per requirements:
    await docRef.delete();
    return true;
};

/**
 * Get tasks assigned to a specific volunteer
 */
const getVolunteerTasks = async (volunteerId, limit = 10, cursor = null) => {
    // Note: Since 'assignments' is an array of objects, we cannot use a simple Firestore 'where' clause.
    // For this demo, we fetch tasks and filter them in memory.
    const snapshot = await db.collection('tasks').get();
    let allTasks = snapshot.docs.map(doc => doc.data());
    
    let tasks = allTasks.filter(task => 
        task.assignments && task.assignments.some(a => a.volunteer_id === volunteerId)
    );
    
    // Manual sort since we can't use orderBy without an index
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const nextCursor = lastVisible ? lastVisible.id : null;

    return { tasks, nextCursor };
};

/**
 * Create a new volunteer manually (Admin only)
 */
const createVolunteer = async (volunteerData) => {
    // Note: This only creates the Firestore document. 
    // The user must still exist in Firebase Auth or sign up with the same email.
    // For a full admin-create flow, we'd use admin.auth().createUser().
    const volunteerRef = db.collection('users').doc();
    const newVolunteer = {
        uid: volunteerRef.id,
        ...volunteerData,
        role: 'volunteer',
        performance_score: 0,
        tasks_completed: 0,
        hours_contributed: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await volunteerRef.set(newVolunteer);
    return newVolunteer;
};

module.exports = {
    getAllVolunteers,
    getVolunteerById,
    createVolunteer,
    updateVolunteer,
    deleteVolunteer,
    getVolunteerTasks
};
