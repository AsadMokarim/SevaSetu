const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Heuristic-based confidence scoring for Gemini output.
 */
const calculateGeminiConfidence = (data, rawText) => {
    let score = 0.5; // Base score

    if (!data) return 0;

    // Check for critical fields
    if (data.title && data.title.length > 5) score += 0.1;
    if (data.location && data.location.length > 5) score += 0.1;
    if (data.peopleNeeded && typeof data.peopleNeeded === 'number') score += 0.1;
    if (data.urgency && ['low', 'medium', 'high'].includes(data.urgency.toLowerCase())) score += 0.1;
    if (data.type && data.type !== 'other') score += 0.1;

    // Penalty for extremely short descriptions
    if (!data.description || data.description.length < 20) score -= 0.1;

    return Math.max(0, Math.min(1, score));
};

/**
 * Parses raw OCR text into structured JSON using Google Gemini AI.
 */
const parseWithGemini = async (rawText, retryCount = 1) => {
    if (!rawText || rawText.length < 10) {
        console.log("[Gemini] Text too short for AI parsing.");
        return null;
    }

    try {
        console.log("[Gemini] Sending raw text for structured parsing...");
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
Convert the following disaster report into structured JSON.

Extract:
- title (Brief descriptive title)
- description (Summary of the situation)
- location (Specific address or area mentioned)
- peopleNeeded (Number of volunteers/people required)
- type (Strictly one of: food, medical, rescue, shelter, other)
- urgency (Strictly one of: low, medium, high)

Rules:
1. Output ONLY valid JSON.
2. Do NOT include explanations, markdown code blocks, or preamble.
3. Use context-aware inference if data is missing (अनुमान लगाओ).
4. Ensure all fields are present in the JSON object.

Input OCR Text:
"""
${rawText}
"""
`;

        const startTime = Date.now();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const processingTimeMs = Date.now() - startTime;

        console.log("[Gemini] Raw AI Response:", text);

        // Strip markdown if Gemini includes it
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : text;

        let structuredData;
        try {
            structuredData = JSON.parse(jsonString);
        } catch (parseError) {
            console.error("[Gemini] JSON Parse Error. Retrying...", parseError.message);
            if (retryCount > 0) {
                return await parseWithGemini(rawText, retryCount - 1);
            }
            throw parseError;
        }

        const confidence = calculateGeminiConfidence(structuredData, rawText);

        console.log("[Gemini] Final Structured JSON:", JSON.stringify(structuredData, null, 2));
        
        return {
            structuredData,
            aiMeta: {
                model: "gemini-flash-latest",
                confidence,
                processingTimeMs,
                fallbackUsed: false
            }
        };
    } catch (error) {
        console.error("[Gemini] Fatal Error:", error.message);
        return null;
    }
};

module.exports = { parseWithGemini };
