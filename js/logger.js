
const LOG_API = '/api/log';

export function getUserIdentity() {
    let user = localStorage.getItem('dashboard_user');
    if (!user) {
        user = prompt("Please enter your Name or ID to access the dashboard:");
        if (user) {
            localStorage.setItem('dashboard_user', user);
        } else {
            user = "Anonymous";
        }
    }
    return user;
}

export async function logSearch(query, topResult) {
    const user = getUserIdentity();
    const payload = {
        user,
        query,
        topResult,
        // topResult usually object like { Route: 123, YARD: '...', ... }
        // We'll store a simplified string summary
        topResultSummary: topResult ? `${topResult.Route} (${topResult.YARD})` : "No Match"
    };

    try {
        await fetch(LOG_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.warn("Failed to log search", e);
    }
}
