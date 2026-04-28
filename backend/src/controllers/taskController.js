const taskService = require('../services/taskService');
const { taskSchema, taskUpdateSchema } = require('../models/taskModel');
const { filterEligibleVolunteers, buildActiveTaskCountMap } = require('../services/matching/matcher');
const { computeMatchScore } = require('../services/matching/scorer');
const { db } = require('../config/firebase');

const createTask = async (req, res) => {
    try {
        const { error, value } = taskSchema.validate(req.body);
        if (error) {
            console.error('Task Validation Error:', error.details);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null
            });
        }

        const task = await taskService.createTask(value);
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const { limit, cursor } = req.query;
        const { tasks, nextCursor } = await taskService.getAllTasks(limit, cursor);
        res.status(200).json({
            success: true,
            message: 'Tasks retrieved successfully',
            data: { tasks, nextCursor }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const getTaskById = async (req, res) => {
    try {
        const task = await taskService.getTaskById(req.params.task_id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: 'Task retrieved successfully',
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const updateTask = async (req, res) => {
    try {
        const { error, value } = taskUpdateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null
            });
        }

        const task = await taskService.updateTask(req.params.task_id, value);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const deleted = await taskService.deleteTask(req.params.task_id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
            data: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

// Lifecycle methods

const acceptTask = async (req, res) => {
    try {
        const task = await taskService.acceptTask(req.params.task_id, req.user.uid);
        res.status(200).json({
            success: true,
            message: 'Task accepted successfully',
            data: task
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const rejectTask = async (req, res) => {
    try {
        const task = await taskService.rejectTask(req.params.task_id, req.user.uid);
        res.status(200).json({
            success: true,
            message: 'Task rejected successfully',
            data: task
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const completeTask = async (req, res) => {
    try {
        const task = await taskService.completeTask(req.params.task_id, req.user.uid);
        res.status(200).json({
            success: true,
            message: 'Task completed successfully',
            data: task
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const fcmService = require('../services/fcmService');

const assignTask = async (req, res) => {
    try {
        const { volunteerId, volunteerIds } = req.body;
        const idsToAssign = volunteerIds || (volunteerId ? [volunteerId] : []);
        
        if (idsToAssign.length === 0) throw new Error('At least one volunteerId is required');

        const task = await taskService.assignTask(req.params.task_id, idsToAssign);

        // --- Phase 1: Notify volunteers asynchronously ---
        idsToAssign.forEach(vId => {
            const link = `/volunteer/tasks`;
            fcmService.notifyVolunteer(vId, `🚨 New Task Assigned: ${task.title}`, `You have been assigned to an emergency task in ${task.location}. Tap to view.`, link)
                .catch(err => console.error(`Failed to notify ${vId}:`, err));
        });

        res.status(200).json({
            success: true,
            message: 'Volunteers assigned successfully',
            data: task
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const unassignTask = async (req, res) => {
    try {
        const task = await taskService.unassignTask(req.params.task_id, req.params.volunteer_id);
        res.status(200).json({
            success: true,
            message: 'Volunteer unassigned successfully',
            data: task
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

/**
 * PUT /api/tasks/:task_id/admin-complete
 * Admin explicitly marks task as fully completed
 */
const adminCompleteTask = async (req, res) => {
    try {
        const task = await taskService.adminCompleteTask(req.params.task_id);
        res.status(200).json({
            success: true,
            message: 'Task marked as completed successfully',
            data: task
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

/**
 * GET /api/tasks/:task_id/matches
 * Returns ranked volunteer candidates with scores and explanations.
 * Admin only. Used to show smart matching decisions in the UI.
 */
const getTaskMatches = async (req, res) => {
    try {
        const taskDoc = await db.collection('tasks').doc(req.params.task_id).get();
        if (!taskDoc.exists) {
            return res.status(404).json({ success: false, message: 'Task not found', data: null });
        }
        const task = { id: taskDoc.id, ...taskDoc.data() };

        // Fetch all available volunteers
        const snapshot = await db.collection('users')
            .where('role', '==', 'volunteer')
            .where('is_available', '==', true)
            .get();
        const allVolunteers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const activeTaskCountMap = await buildActiveTaskCountMap(db);
        const { eligible, normalizedSkillsMap } = filterEligibleVolunteers(task, allVolunteers, activeTaskCountMap);

        // Score and rank all eligible volunteers
        const ranked = eligible.map(vol => {
            const volId      = vol.uid || vol.id;
            const skills     = normalizedSkillsMap.get(volId) || [];
            const count      = activeTaskCountMap.get(volId) || 0;
            const { total, breakdown, emergencyMode, weights } = computeMatchScore(vol, task, skills, count);

            return {
                volunteer_id:   volId,
                name:           vol.name || vol.email,
                email:          vol.email,
                location:       vol.location,
                skills:         vol.skills,
                performance_score: vol.performance_score,
                active_tasks:   count,
                match_score:    total,
                emergency_mode: emergencyMode,
                weights_used:   weights,
                breakdown,
            };
        }).sort((a, b) => b.match_score - a.match_score);

        res.status(200).json({
            success: true,
            message: `Found ${ranked.length} candidate(s) for this task`,
            data: {
                task_id:    task.id,
                task_title: task.title,
                priority:   task.priority,
                slots_needed: task.total_volunteers,
                current_assignments: task.assignments?.length || 0,
                candidates: ranked,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    acceptTask,
    rejectTask,
    completeTask,
    assignTask,
    unassignTask,
    getTaskMatches,
    adminCompleteTask,
};
