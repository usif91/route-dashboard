import { GOOGLE_SCRIPT_URL } from './config.js';

// Simple "fingerprint" to persist identity across reloads without asking name
function getClientId() {
    let id = localStorage.getItem('dashboard_client_id');
    if (!id) {
        id = 'User-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('dashboard_client_id', id);
    }
    return id;
}

export async function logSearch(query, topResult) {
    if (GOOGLE_SCRIPT_URL.includes("YOUR_")) {
        console.warn("Google Script URL not set in js/config.js");
        return;
    }

    const payload = {
        user: getClientId(), // Send a client ID so we can group them later
        ip: "Client",        // IP is hard to get client-side without 3rd party service
        query,
        topResultSummary: topResult ? `${topResult.Route} (${topResult.YARD})` : "No Match"
    };

    try {
        // We send as plain text (default) to avoid CORS Preflight (OPTIONS request) which GAS hates.
        // Google Script will just parse the POST body as JSON.
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.warn("Failed to log search", e);
    }
}
