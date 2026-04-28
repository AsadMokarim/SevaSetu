const surveyService = require('../services/surveyService');
const ocrService = require('../services/ocrService');
const { surveySchema, surveyUpdateSchema } = require('../models/surveyModel');

const createSurvey = async (req, res) => {
    try {
        // Map raw_text to description for Joi validation if needed
        if (!req.body.description && req.body.raw_text) {
            req.body.description = req.body.raw_text;
        }

        const { error, value } = surveySchema.validate(req.body);
        if (error) {
            console.error('Survey Validation Error:', error.details);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null
            });
        }

        const survey = await surveyService.createSurvey(value, req.user.uid);
        res.status(201).json({
            success: true,
            message: 'Survey created successfully',
            data: survey
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const getAllSurveys = async (req, res) => {
    try {
        const { limit, cursor } = req.query;
        const { surveys, nextCursor } = await surveyService.getAllSurveys(limit, cursor);
        res.status(200).json({
            success: true,
            message: 'Surveys retrieved successfully',
            data: { surveys, nextCursor }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const getSurveyById = async (req, res) => {
    try {
        const survey = await surveyService.getSurveyById(req.params.survey_id);
        if (!survey) {
            return res.status(404).json({
                success: false,
                message: 'Survey not found',
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: 'Survey retrieved successfully',
            data: survey
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const updateSurvey = async (req, res) => {
    try {
        const { error, value } = surveyUpdateSchema.validate(req.body);
        if (error) {
            console.error('Survey Update Validation Error:', error.details);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null
            });
        }

        const survey = await surveyService.updateSurvey(req.params.survey_id, value);
        if (!survey) {
            return res.status(404).json({
                success: false,
                message: 'Survey not found',
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: 'Survey updated successfully',
            data: survey
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const deleteSurvey = async (req, res) => {
    try {
        const deleted = await surveyService.deleteSurvey(req.params.survey_id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Survey not found',
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: 'Survey deleted successfully',
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

const voteOnSurvey = async (req, res) => {
    try {
        const { voteType } = req.body; // 'confirm' or 'flag'
        if (!['confirm', 'flag'].includes(voteType)) {
            return res.status(400).json({ success: false, message: 'Invalid vote type' });
        }

        const result = await surveyService.voteOnSurvey(req.params.survey_id, req.user.uid, voteType);
        res.status(200).json({
            success: true,
            message: 'Vote recorded successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const extractFromFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // 1. OCR Extraction
        const { rawText, method, confidence, debugImages } = await ocrService.extractText(req.file.buffer, req.file.mimetype);
        if (!rawText) {
            return res.status(422).json({ success: false, message: 'Could not extract any text from the file' });
        }

        // 2. Parse Text
        const extractedData = ocrService.parseSurveyText(rawText, confidence);

        if (extractedData.error === 'LOW_OCR_QUALITY') {
            return res.status(422).json({
                success: false,
                error_code: 'LOW_OCR_QUALITY',
                message: 'Unable to extract readable text. Please upload a clearer image or enter details manually.',
                isHandwritten: extractedData.isHandwritten,
                _debug: { ...extractedData, debugImages } // Helpful in dev
            });
        }

        // 3. Geocode Location
        let geoData = null;
        if (extractedData.location) {
            geoData = await ocrService.geocodeLocation(extractedData.location);
        }

        const result = {
            ...extractedData,
            lat: geoData ? geoData.lat : null,
            lng: geoData ? geoData.lng : null,
            formattedAddress: geoData ? geoData.formattedAddress : extractedData.location,
            geocodingConfidence: geoData ? geoData.confidence : 0,
            geocodingProvider: geoData ? geoData.provider : 'none',
            extractionMethod: method,
            rawText: rawText.slice(0, 1000) // For debugging
        };

        res.status(200).json({
            success: true,
            message: 'Data extracted successfully',
            data: result
        });
    } catch (error) {
        console.error('[Extract] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Extraction failed: ' + error.message
        });
    }
};

module.exports = {
    createSurvey,
    getAllSurveys,
    getSurveyById,
    updateSurvey,
    deleteSurvey,
    voteOnSurvey,
    extractFromFile,
    geocode: async (req, res) => {
        try {
            const { q } = req.query;
            const geocodingService = require('../services/geocodingService');
            if (!q) return res.status(400).json({ success: false, message: 'Query parameter q is required' });
            
            const result = await geocodingService.geocode(q);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
