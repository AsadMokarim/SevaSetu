const Joi = require('joi');

const surveySchema = Joi.object({
    title: Joi.string().allow(''),
    description: Joi.string().optional().min(1).max(5000), // Increased max for raw_text
    raw_text: Joi.string().allow(''), // Allow raw_text from frontend
    location: Joi.string().optional().allow(''),
    people_needed: Joi.number().optional().default(1),
    event_date: Joi.string().optional().allow(''),
    images: Joi.array().items(Joi.string().uri()).default([]),
    metadata: Joi.object().optional().default({})
}).unknown(true);

const surveyUpdateSchema = Joi.object({
    description: Joi.string().min(1).max(1000),
    images: Joi.array().items(Joi.string().uri()),
    location: Joi.string().allow(''),
    status: Joi.string().valid('pending', 'processed'),
    aiAnalysis: Joi.object({
        category: Joi.string(),
        urgencyScore: Joi.number().min(1).max(10),
        summary: Joi.string()
    })
}).min(1).unknown(true);

module.exports = {
    surveySchema,
    surveyUpdateSchema
};
