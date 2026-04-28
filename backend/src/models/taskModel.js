const Joi = require('joi');

const taskSchema = Joi.object({
    surveyId: Joi.string().allow(null, '').default(null),
    priority: Joi.string().uppercase().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').default('MEDIUM'),
    location: Joi.string().allow(''),
    description: Joi.string().required(),
    title: Joi.string().allow(''),
    category: Joi.string().allow(''),
    total_volunteers: Joi.number().integer().min(1).default(1),
    assignedTo: Joi.string().allow(null, '').default(null)
});

const taskUpdateSchema = Joi.object({
    status: Joi.string().valid('open', 'assigned', 'accepted', 'rejected', 'completed'),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    location: Joi.string().allow(''),
    title: Joi.string().allow(''),
    category: Joi.string().allow(''),
    description: Joi.string().allow(''),
    total_volunteers: Joi.number().integer().min(1),
    markIncomplete: Joi.boolean(),
    assignedTo: Joi.string().allow(null, '')
}).min(1);

module.exports = {
    taskSchema,
    taskUpdateSchema
};
