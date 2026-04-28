const { db, admin } = require('../config/firebase');
const notificationService = require('./notificationService');
const { runSingleTaskMatch } = require('./matching');

/**
 * Create a new task
 */
const createTask = async (taskData) => {
    const taskRef = db.collection('tasks').doc();
    const newTask = {
        id: taskRef.id,
        surveyId: taskData.surveyId || null,
        title: taskData.title || 'Untitled Task',
        description: taskData.description,
        category: taskData.category || 'General',
        total_volunteers: taskData.total_volunteers || 1,
        assignments: [], // Changed from assignedTo (singular)
        status: 'open',
        priority: (taskData.priority || taskData.urgency || 'MEDIUM').toUpperCase(),
        location: taskData.location || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await taskRef.set(newTask);
    return newTask;
};

/**
 * Get all tasks with pagination
 */
const getAllTasks = async (limit = 10, cursor = null) => {
    let query = db.collection('tasks').orderBy('createdAt', 'desc').limit(parseInt(limit));

    if (cursor) {
        const startAfterDoc = await db.collection('tasks').doc(cursor).get();
        if (startAfterDoc.exists) {
            query = query.startAfter(startAfterDoc);
        }
    }

    const snapshot = await query.get();
    const tasks = snapshot.docs.map(doc => doc.data());

    // Fetch volunteer details to populate 'assignments' array for the premium UI
    const tasksWithAssignments = await Promise.all(tasks.map(async (task) => {
        const rawAssignments = task.assignments || [];
        const enrichedAssignments = await Promise.all(rawAssignments.map(async (a) => {
            const volunteerDoc = await db.collection('users').doc(a.volunteer_id).get();
            const volData = volunteerDoc.exists ? volunteerDoc.data() : { name: 'Unknown' };
            
            return {
                ...a,
                volunteer_name: volData.name || volData.email?.split('@')[0] || 'Unknown',
                status: a.status
            };
        }));

        const taskDisplayStatus = task.status === 'open' ? 'Pending' : 
                                  (task.status === 'accepted' ? 'Assigned' : 
                                  (task.status === 'completed' ? 'Completed' : task.status));

        return { 
            ...task, 
            status: taskDisplayStatus,
            assignments: enrichedAssignments,
            volunteer_names: enrichedAssignments.map(a => a.volunteer_name)
        };
    }));
    
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const nextCursor = lastVisible ? lastVisible.id : null;

    return { tasks: tasksWithAssignments, nextCursor };
};

/**
 * Get task by ID
 */
const getTaskById = async (taskId) => {
    const taskDoc = await db.collection('tasks').doc(taskId).get();
    if (!taskDoc.exists) return null;
    const task = taskDoc.data();

    const rawAssignments = task.assignments || [];
    const assignments = await Promise.all(rawAssignments.map(async (a) => {
        const volunteerDoc = await db.collection('users').doc(a.volunteer_id).get();
        const volData = volunteerDoc.exists ? volunteerDoc.data() : { name: 'Unknown' };
        
        return {
            ...a,
            volunteer_name: volData.name || volData.email?.split('@')[0] || 'Unknown',
            status: a.status
        };
    }));

    return { ...task, assignments };
};

/**
 * Update task general details + handle markIncomplete flag
 */
const updateTask = async (taskId, updateData) => {
    const taskRef = db.collection('tasks').doc(taskId);
    
    return await db.runTransaction(async (transaction) => {
        const taskDoc = await transaction.get(taskRef);
        if (!taskDoc.exists) throw new Error('Task not found');
        
        const taskData = taskDoc.data();
        let updatedData = { ...updateData };
        let assignments = taskData.assignments || [];
        
        // Handle marking as incomplete
        if (updatedData.markIncomplete) {
            const volunteersToDecrement = [];
            
            assignments = assignments.map(a => {
                if (a.status === 'completed') {
                    volunteersToDecrement.push(a.volunteer_id);
                    return { ...a, status: 'accepted', completedAt: null };
                }
                return a;
            });
            
            updatedData.status = 'assigned';
            updatedData.assignments = assignments;
            delete updatedData.markIncomplete; // Remove flag before saving

            // Decrement stats for those who were reverted
            for (const volId of volunteersToDecrement) {
                const userRef = db.collection('users').doc(volId);
                transaction.update(userRef, {
                    tasks_completed: admin.firestore.FieldValue.increment(-1)
                });
            }
        }

        updatedData.updatedAt = new Date().toISOString();
        transaction.update(taskRef, updatedData);

        return { id: taskId, ...taskData, ...updatedData };
    });
};

/**
 * Delete task
 */
const deleteTask = async (taskId) => {
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) return false;

    await taskRef.delete();
    return true;
};

/**
 * Task Lifecycle: Assign to volunteer
 */
const assignTask = async (taskId, volunteerIds) => {
    const ids = Array.isArray(volunteerIds) ? volunteerIds : [volunteerIds];
    const taskRef = db.collection('tasks').doc(taskId);

    return await db.runTransaction(async (transaction) => {
        const taskDoc = await transaction.get(taskRef);
        if (!taskDoc.exists) throw new Error('Task not found');
        
        const taskData = taskDoc.data();
        const currentAssignments = taskData.assignments || [];
        const totalNeeded = taskData.total_volunteers || 1;

        // Filter out already assigned volunteers
        const alreadyAssigned = currentAssignments.map(a => a.volunteer_id);
        const newIds = ids.filter(id => !alreadyAssigned.includes(id));

        if (newIds.length === 0) {
            return { id: taskId, ...taskData, assignments: currentAssignments };
        }

        // Check capacity
        if (currentAssignments.length + newIds.length > totalNeeded) {
            throw new Error(`Task volunteer capacity reached. Can only assign ${totalNeeded - currentAssignments.length} more.`);
        }

        const newAssignments = newIds.map(id => ({
            volunteer_id: id,
            status: 'assigned',
            assignedAt: new Date().toISOString()
        }));

        const updatedAssignments = [...currentAssignments, ...newAssignments];

        // Only update the overall task status to 'assigned' if it's currently 'open'
        const newStatus = taskData.status === 'open' ? 'assigned' : taskData.status;

        transaction.update(taskRef, {
            assignments: updatedAssignments,
            status: newStatus,
            updatedAt: new Date().toISOString()
        });

        // Notify new volunteers (outside transaction or as a side effect)
        newIds.forEach(id => {
            // 1. Push Notification (FCM)
            notificationService.sendNotificationToUser(
                id, 
                'New Task Assigned', 
                'You have been assigned a new task by an admin. Please review and accept.',
                { taskId }
            ).catch(console.error);

            // 2. In-App Notification
            const volunteerNotificationService = require('./volunteerNotificationService');
            volunteerNotificationService.createNotification(id, {
                title: '🚨 New Task Assigned',
                message: `You have been assigned to: ${taskData.title}`,
                type: 'TASK_ASSIGNED',
                link: `/volunteer/tasks`
            }).catch(console.error);
        });

        return { id: taskId, ...taskData, assignments: updatedAssignments, status: newStatus };
    });
};

/**
 * Task Lifecycle: Unassign volunteer
 */
const unassignTask = async (taskId, volunteerId) => {
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) throw new Error('Task not found');
    const taskData = taskDoc.data();
    const assignments = taskData.assignments || [];

    const updatedAssignments = assignments.filter(a => a.volunteer_id !== volunteerId);
    const newStatus = updatedAssignments.length === 0 ? 'open' : taskData.status;

    await taskRef.update({
        assignments: updatedAssignments,
        status: newStatus,
        updatedAt: new Date().toISOString()
    });

    return { id: taskId, ...taskData, assignments: updatedAssignments, status: newStatus };
};

/**
 * Task Lifecycle: Accept task (by volunteer)
 */
const acceptTask = async (taskId, volunteerId) => {
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) throw new Error('Task not found');
    const taskData = taskDoc.data();
    const assignments = taskData.assignments || [];

    const updatedAssignments = assignments.map(a => {
        if (a.volunteer_id === volunteerId) {
            return { ...a, status: 'accepted', updatedAt: new Date().toISOString() };
        }
        return a;
    });

    // If volunteer wasn't in assignments (e.g. self-assigning from open pool)
    if (!assignments.some(a => a.volunteer_id === volunteerId)) {
        updatedAssignments.push({
            volunteer_id: volunteerId,
            status: 'accepted',
            assignedAt: new Date().toISOString()
        });
    }

    await taskRef.update({
        assignments: updatedAssignments,
        status: 'accepted',
        updatedAt: new Date().toISOString()
    });

    return { ...taskData, assignments: updatedAssignments, status: 'accepted' };
};

/**
 * Task Lifecycle: Reject task (by volunteer)
 */
const rejectTask = async (taskId, volunteerId) => {
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) throw new Error('Task not found');
    const taskData = taskDoc.data();
    const assignments = taskData.assignments || [];

    const updatedAssignments = assignments.filter(a => a.volunteer_id !== volunteerId);
    const newStatus = updatedAssignments.length === 0 ? 'open' : taskData.status;

    await taskRef.update({
        assignments: updatedAssignments,
        status: newStatus,
        updatedAt: new Date().toISOString()
    });

    // Notify admins that the task was rejected
    notificationService.notifyAdmins(
        'Task Rejected', 
        `A volunteer has rejected task ${taskId}.`,
        { taskId }
    ).catch(console.error);

    // Trigger re-matching to fill the open slot (fire-and-forget)
    runSingleTaskMatch(taskId, [volunteerId])
        .catch(err => console.error('[RejectTask] Re-match failed:', err.message));

    return { ...taskData, assignments: updatedAssignments, status: newStatus };
};

/**
 * Task Lifecycle: Complete task
 */
const completeTask = async (taskId, volunteerId) => {
    const taskRef = db.collection('tasks').doc(taskId);
    
    return await db.runTransaction(async (transaction) => {
        const taskDoc = await transaction.get(taskRef);
        if (!taskDoc.exists) throw new Error('Task not found');
        
        const taskData = taskDoc.data();
        const assignments = taskData.assignments || [];
        
        let wasAlreadyCompleted = false;

        const updatedAssignments = assignments.map(a => {
            if (a.volunteer_id === volunteerId) {
                if (a.status === 'completed') {
                    wasAlreadyCompleted = true;
                }
                return { ...a, status: 'completed', completedAt: new Date().toISOString() };
            }
            return a;
        });

        // Determine task status: if ALL assignments are completed, task is completed
        const allCompleted = updatedAssignments.length > 0 && updatedAssignments.every(a => a.status === 'completed');
        const newStatus = allCompleted ? 'completed' : 'accepted';

        transaction.update(taskRef, {
            assignments: updatedAssignments,
            status: newStatus,
            updatedAt: new Date().toISOString()
        });

        // If it wasn't already completed by this volunteer, increment their completed count
        if (!wasAlreadyCompleted) {
            const userRef = db.collection('users').doc(volunteerId);
            transaction.update(userRef, {
                tasks_completed: admin.firestore.FieldValue.increment(1)
            });
        }

        // Notify admins if fully completed (done outside transaction but safely)
        if (allCompleted) {
            notificationService.notifyAdmins(
                'Task Fully Completed', 
                `Task ${taskId} has been fully completed by all assigned volunteers.`,
                { taskId }
            ).catch(console.error);
        }

        return { ...taskData, assignments: updatedAssignments, status: newStatus };
    });
};

/**
 * Task Lifecycle: Admin explicitly marks task as fully completed
 * This marks all assigned volunteers as completed (incrementing their stats if needed)
 */
const adminCompleteTask = async (taskId) => {
    const taskRef = db.collection('tasks').doc(taskId);
    
    return await db.runTransaction(async (transaction) => {
        const taskDoc = await transaction.get(taskRef);
        if (!taskDoc.exists) throw new Error('Task not found');
        
        const taskData = taskDoc.data();
        const assignments = taskData.assignments || [];
        
        const newlyCompletedVolunteerIds = [];

        const updatedAssignments = assignments.map(a => {
            // If they aren't already completed, we will mark them and increment their score
            if (a.status !== 'completed' && a.status !== 'unassigned') {
                newlyCompletedVolunteerIds.push(a.volunteer_id);
            }
            return { ...a, status: 'completed', completedAt: new Date().toISOString() };
        });

        // Set task status to completed
        const newStatus = 'completed';

        transaction.update(taskRef, {
            assignments: updatedAssignments,
            status: newStatus,
            updatedAt: new Date().toISOString()
        });

        // Increment stats for those who were just forced to completed
        for (const volId of newlyCompletedVolunteerIds) {
            const userRef = db.collection('users').doc(volId);
            transaction.update(userRef, {
                tasks_completed: admin.firestore.FieldValue.increment(1)
            });
        }

        return { ...taskData, assignments: updatedAssignments, status: newStatus };
    });
};

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    assignTask,
    unassignTask,
    acceptTask,
    rejectTask,
    completeTask,
    adminCompleteTask
};
