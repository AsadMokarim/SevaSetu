const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * DEBUG: Directly parse text using Gemini
 * Useful for demoing AI intelligence without image uploads.
 */
router.post('/parse-text', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ success: false, message: 'Text field is required' });
        }

        const result = await geminiService.parseWithGemini(text);
        
        if (!result) {
            return res.status(500).json({ 
                success: false, 
                message: 'Gemini parsing failed' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Text parsed successfully',
            data: {
                rawText: text,
                structuredData: result.structuredData,
                aiMeta: result.aiMeta
            }
        });
    } catch (error) {
        console.error('[DebugApi] Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
