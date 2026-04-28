const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const { verifyToken } = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// All survey routes require authentication
router.use(verifyToken);

router.get('/', surveyController.getAllSurveys);
router.post('/', upload.single('image'), surveyController.createSurvey);
// Geocoding (Shared Service) - Must be above /:survey_id to avoid conflict
router.get('/geocode', surveyController.geocode);

router.get('/:survey_id', surveyController.getSurveyById);
router.put('/:survey_id', surveyController.updateSurvey);
router.delete('/:survey_id', surveyController.deleteSurvey);

// OCR / Extraction flow
router.post('/extract-from-file', upload.single('file'), surveyController.extractFromFile);

// Crowd Verification (Voting)
router.post('/:survey_id/vote', surveyController.voteOnSurvey);

module.exports = router;
