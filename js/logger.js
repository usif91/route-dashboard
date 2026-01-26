const LOG_API = '/api/log';

export async function logSearch(query, topResult) {
    // No prompt anymore. Server will attach IP.
    const payload = {
        query,
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
