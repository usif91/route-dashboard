import { GOOGLE_SCRIPT_URL } from './config.js';

function getClientId() {
    let id = localStorage.getItem('dashboard_client_id');
    if (!id) {
        id = 'User-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('dashboard_client_id', id);
    }
    return id;
}

export async function logSearch(query, details = {}) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_")) {
        console.warn("Google Script URL not set");
        return;
    }

    const topResult = details.topResult;
    const params = new URLSearchParams({
        user: getClientId(),
        query: query,
        topResultSummary: topResult ? `${topResult.Route} (${topResult.YARD})` : "No Match",
        intersection: details.intersection || (topResult ? topResult.STREETSORT : ""),
        location: details.location ? `${details.location.lat},${details.location.lon}` : ""
    });

    const fullUrl = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;

    // "Fire and Forget" using Image Beacon. 
    // This is the most reliable way to send GET requests across domains without CORS issues.
    new Image().src = fullUrl;

    console.log("Logged:", query);
}
