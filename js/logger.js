import { GOOGLE_SCRIPT_URL } from './config.js';

function getClientId() {
    let id = localStorage.getItem('dashboard_client_id');
    if (!id) {
        id = 'User-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('dashboard_client_id', id);
    }
    return id;
}

export async function logSearch(query, topResult) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_")) {
        console.warn("Google Script URL not set");
        return;
    }

    const params = new URLSearchParams({
        user: getClientId(),
        query: query,
        topResultSummary: topResult ? `${topResult.Route} (${topResult.YARD})` : "No Match"
    });

    const fullUrl = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;

    try {
        // Using GET avoids Preflight/CORS issues with Body parsing
        await fetch(fullUrl, {
            method: 'GET',
            mode: 'cors' // Google Script handles GET CORS well
        });
        console.log("Logged via GET:", query);
    } catch (e) {
        console.warn("Failed to log search", e);
        // Fallback: Image beacon (fire and forget)
        new Image().src = fullUrl;
    }
}
