const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// In-memory cache
const geoCache = new Map();

// Rate limiting for Nominatim (1 req/sec)
let lastRequestTime = 0;
const NOMINATIM_DELAY = 1000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Unified Geocoding Service
 */
const geocode = async (address) => {
    if (!address) return { lat: null, lng: null, formattedAddress: '', confidence: 0, provider: 'none' };

    // 1. Check Cache
    if (geoCache.has(address)) {
        console.log(`[Geocode] Cache hit for: ${address}`);
        return geoCache.get(address);
    }

    let result = null;

    // 2. Try Nominatim (Free)
    try {
        result = await geocodeNominatim(address);
        
        // --- Aggressive Fallbacks ---
        
        // Fallback 1: Remove prefixes (at, near, etc.)
        if (!result) {
            const simplified = address.replace(/^(at|in|near|near to|around|location:)\s+/i, '').trim();
            if (simplified !== address) {
                console.log(`[Geocode] Fallback 1 (Simplified): ${simplified}`);
                result = await geocodeNominatim(simplified);
            }
        }

        // Fallback 2: Try only the last two words (often city/area)
        if (!result) {
            const parts = address.split(/[,\s]+/).filter(p => p.length > 2);
            if (parts.length > 2) {
                const cityArea = parts.slice(-2).join(' ');
                console.log(`[Geocode] Fallback 2 (City/Area): ${cityArea}`);
                result = await geocodeNominatim(cityArea);
            }
        }

        // Fallback 3: Try only the first two words
        if (!result) {
            const parts = address.split(/[,\s]+/).filter(p => p.length > 2);
            if (parts.length > 2) {
                const startArea = parts.slice(0, 2).join(' ');
                console.log(`[Geocode] Fallback 3 (Start Area): ${startArea}`);
                result = await geocodeNominatim(startArea);
            }
        }
    } catch (error) {
        console.error('[Geocode] Nominatim failed:', error.message);
    }

    // 3. Fallback: geocode.maps.co (Free, no API key required for low volume)
    if (!result) {
        try {
            console.log(`[Geocode] Falling back to geocode.maps.co for: ${address}`);
            const response = await axios.get('https://geocode.maps.co/search', {
                params: { q: address }
            });
            if (response.data && response.data.length > 0) {
                const first = response.data[0];
                result = {
                    lat: parseFloat(first.lat),
                    lng: parseFloat(first.lon),
                    formattedAddress: first.display_name,
                    confidence: 0.6,
                    provider: 'maps.co'
                };
            }
        } catch (error) {
            console.error('[Geocode] maps.co failed:', error.message);
        }
    }

    // 4. Optional Fallback: Google
    // Trigger if Nominatim failed, returned low confidence, or no results
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (googleApiKey && (!result || result.confidence < 0.5)) {
        try {
            const googleResult = await geocodeGoogle(address);
            if (googleResult && (!result || googleResult.confidence > result.confidence)) {
                result = googleResult;
            }
        } catch (error) {
            console.error('[Geocode] Google fallback failed:', error.message);
        }
    }

    // 5. Final Result Handling
    if (!result) {
        result = {
            lat: null,
            lng: null,
            formattedAddress: address,
            confidence: 0,
            provider: 'none'
        };
    }

    // 6. Store in Cache
    geoCache.set(address, result);
    return result;
};

/**
 * Nominatim (OpenStreetMap) Implementation
 */
const geocodeNominatim = async (address) => {
    // Throttling
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < NOMINATIM_DELAY) {
        await sleep(NOMINATIM_DELAY - timeSinceLast);
    }
    lastRequestTime = Date.now();

    console.log(`[Geocode] Nominatim: ${address}`);
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
            q: address,
            format: 'json',
            limit: 1,
            addressdetails: 1,
            countrycodes: 'in' // Bias to India
        },
        headers: {
            'User-Agent': `SevaSetu-App-v1.1-${Math.random().toString(36).substring(7)}`,
            'Accept-Language': 'en-US,en;q=0.9'
        }
    });

    if (response.data && response.data.length > 0) {
        const first = response.data[0];
        return {
            lat: parseFloat(first.lat),
            lng: parseFloat(first.lon),
            formattedAddress: first.display_name,
            confidence: parseFloat(first.importance || 0.5),
            provider: 'nominatim'
        };
    }
    return null;
};

/**
 * Google Maps Geocoding Implementation
 */
const geocodeGoogle = async (address) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    console.log(`[Geocode] Google Fallback: ${address}`);
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
            address: address,
            key: apiKey,
            components: 'country:IN' // Bias to India
        }
    });

    if (response.data.status === 'OK') {
        const first = response.data.results[0];
        // Google doesn't provide importance; we'll calculate based on match type
        let confidence = 0.9;
        if (first.geometry.location_type === 'APPROXIMATE') confidence = 0.6;
        if (first.partial_match) confidence -= 0.2;

        return {
            lat: first.geometry.location.lat,
            lng: first.geometry.location.lng,
            formattedAddress: first.formatted_address,
            confidence: Math.max(0, confidence),
            provider: 'google'
        };
    }
    return null;
};

module.exports = {
    geocode
};
