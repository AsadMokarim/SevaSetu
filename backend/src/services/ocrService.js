const vision = require('@google-cloud/vision');
const Tesseract = require('tesseract.js');
const axios = require('axios');
const dotenv = require('dotenv');
const sharp = require('sharp');
const geocodingService = require('./geocodingService');

dotenv.config();

// Initialize Google Vision client
let visionClient;
let visionBillingDisabled = false;

try {
    visionClient = new vision.ImageAnnotatorClient();
} catch (error) {
    console.warn('[OCR] Google Vision Client failed to initialize. Fallback active.');
}

/**
 * Text Cleaning Layer
 */
const cleanText = (rawText) => {
    if (!rawText) return '';
    let text = rawText.replace(/[^\x20-\x7E\n]/g, ' ');
    const replacements = {
        'volunters': 'volunteers',
        'volunter': 'volunteer',
        'neede': 'needed',
        'distribtion': 'distribution',
        'lajpat ngr': 'lajpat nagar',
        'seelamp': 'seelampur',
        'urgentently': 'urgently',
        'urgnt': 'urgently'
    };
    Object.entries(replacements).forEach(([wrong, right]) => {
        const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
        text = text.replace(regex, right);
    });
    text = text.replace(/(.)\1{4,}/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();
    return text;
};

/**
 * Quality Check
 */
const isQualityLow = (text) => {
    if (!text || text.length < 40) return true;
    const letters = text.match(/[a-zA-Z]/g) || [];
    const letterRatio = letters.length / text.length;
    const words = text.split(/\s+/).filter(w => w.length >= 3 && /[a-zA-Z]/.test(w));

    if (letterRatio < 0.4) return true; // Slightly relaxed for handwriting
    if (words.length < 2) return true;
    return false;
};

/**
 * Advanced Extraction Pipeline
 */
const extractText = async (fileBuffer, mimeType) => {
    console.log(`[OCR] MOCK extraction for ${mimeType}. (Native OCR disabled for Render Demo)`);
    
    // Return a dummy but realistic extraction for the demo
    return { 
        rawText: "URGENT: Food distribution needed at Lajpat Nagar. 20 volunteers required for ration kit packing. Contact: 9876543210", 
        method: 'mock_demo', 
        confidence: 0.95, 
        debugImages: {} 
    };
};

/**
 * Smart Parsing with Handwriting Support
 */
const parseSurveyText = (rawText, confidence = 100) => {
    const cleanedText = cleanText(rawText);

    // Task 4: Handwriting Detection
    const isHandwritten = confidence > 0 && confidence < 75;

    // 🛑 TASK 1: Hard Confidence Threshold
    if (isHandwritten && confidence < 50) {
        console.warn(`[OCR] Rejection: Low confidence handwriting (${confidence}%)`);
        return {
            error: 'LOW_OCR_QUALITY',
            reason: 'low_confidence_handwriting',
            message: 'Handwritten text is too unclear to extract reliably. Please edit manually.',
            isHandwritten: true
        };
    }

    // 🛑 TASK 2: Secondary Text Quality Check
    if (isQualityLow(cleanedText)) {
        console.warn(`[OCR] Rejection: Poor text quality (Length: ${cleanedText.length})`);
        return {
            error: 'LOW_OCR_QUALITY',
            reason: 'poor_text_quality',
            message: 'Text is not readable. Please upload a clearer image.',
            isHandwritten
        };
    }

    const lines = cleanedText.split('\n').map(l => l.trim()).filter(l => l.length > 2);

    // 🛠️ TASK 4: Safe Mode (Confidence 50-70)
    const isSafeMode = isHandwritten && confidence < 70;

    // 1. Determine Title/Category
    let title = null;
    if (!isSafeMode) { // Safe mode blocks title generation
        const categories = {
            'Food': /food|meal|ration|hungry|distrib|ration/i,
            'Medical': /medic|doctor|health|injury|hosp/i,
            'Rescue': /rescue|trapped|save|emerg|flood/i,
            'Water': /water|drink|thirst/i,
            'Shelter': /shelter|home|tent|stay/i
        };

        for (const [cat, regex] of Object.entries(categories)) {
            if (regex.test(cleanedText)) {
                title = `${cat} Support Needed`;
                break;
            }
        }

        if (!title && lines.length > 0) {
            const firstLine = lines[0];
            const validWords = firstLine.split(/\s+/).filter(w => w.length >= 2);
            if (validWords.length >= 3) {
                title = firstLine.slice(0, 100);
            }
        }
    }

    // 2. People Needed (Strict Enforced)
    let peopleNeeded = null;
    const strictPeopleRegex = /(\d+)\s*(?:volunteer|volunteers|people|persons|needed|vols|workers)/i;
    const peopleMatch = cleanedText.match(strictPeopleRegex);
    if (peopleMatch) {
        peopleNeeded = Math.min(100, Math.max(1, parseInt(peopleMatch[1])));
    }

    // 3. Location
    let location = null;
    if (!isSafeMode) {
        const locKeywords = ['at', 'in', 'near', 'location:', 'area:'];
        const locRegex = new RegExp(`(?:${locKeywords.join('|')})\\s+([A-Z0-9][^,.!?\\n]{3,40})`, 'i');
        const locMatch = cleanedText.match(locRegex);
        if (locMatch) {
            location = locMatch[1].trim();
        }
    }

    // 🛑 TASK 3: Final Gate - Block if all fields null
    if (!title && !location && !peopleNeeded) {
        console.warn('[OCR] Extraction Gate: Rejected - No fields could be reliably assigned.');
        return { error: 'LOW_OCR_QUALITY', message: 'Could not extract structured data clearly.', isHandwritten };
    }

    // 📊 TASK 6: Debug Logging
    console.log('[OCR] Final Report:', {
        isHandwritten,
        isSafeMode,
        ocrConfidence: confidence,
        extractedFields: { title, location, peopleNeeded }
    });

    return {
        title,
        description: cleanedText.slice(0, 500),
        location,
        peopleNeeded,
        isHandwritten,
        isSafeMode,
        confidence: confidence / 100,
        _debug: process.env.NODE_ENV === 'development' ? { rawText, cleanedText } : null
    };
};

/**
 * Geocode address to lat/lng
 */
const geocodeLocation = async (address) => {
    if (!address || address.length < 3 || address === 'Unknown Location') return null;
    const alphaCount = (address.match(/[a-z0-9]/gi) || []).length;
    if (alphaCount < 2) return null;
    return await geocodingService.geocode(address);
};

module.exports = {
    extractText,
    parseSurveyText,
    geocodeLocation
};
