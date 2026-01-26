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
        // 'no-cors' is required for Google Apps Script doPost triggers from browser
        // This means we won't get a readable response content, but the request succeeds.
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.warn("Failed to log search", e);
    }
}
