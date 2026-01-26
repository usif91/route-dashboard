// 1. Open your Google Sheet
// 2. Extensions > Apps Script
// 3. Paste this code
// 4. Deploy > New Deployment > Type: Web App > Access: Anyone

function doPost(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data;
    try {
        // If sent as 'application/x-www-form-urlencoded' (default for some), data might be in e.parameter
        // If sent as raw text/json (what we do), it's in e.postData.contents
        var raw = e.postData ? e.postData.contents : JSON.stringify(e.parameter);
        data = JSON.parse(raw);
    } catch (err) {
        // Fallback if parsing fails, just log the error
        data = { query: "JSON Error", topResultSummary: err.message, user: "System", ip: "Error" };
    }
    var timestamp = new Date().toISOString();

    // Format: Time, IP, Name, Query, Top Result
    // Note: We can't easily get the true client IP in GAS consumer accounts reliably without complex proxies,
    // so we will rely on what the client sends or just log "Client". 
    // However, simpler to just log the data sent.

    // If the sheet is empty, add header
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "IP (Simulated)", "Name (Manual)", "Query", "Top Result"]);
    }

    // Create a fingerprint or ID if provided, else just store what we have
    // Since we removed IP tracking from backend, we will assume 'Name' is handled by admin logic or client side
    // For this 'Serverless' version, we rely on the client sending an ID/Name if available, or we just log it.
    // The 'IP' column might be empty if we don't send it from client.

    // Client now sends: { query, topResultSummary, user (optional) }

    sheet.appendRow([
        timestamp,
        data.ip || "Unknown",
        data.user || "Anonymous",
        data.query,
        data.topResultSummary
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var data = rows.slice(1);

    // Transform to list of objects
    var logs = data.map(function (row) {
        return {
            timestamp: row[0],
            ip: row[1],
            user: row[2],
            query: row[3],
            topResultSummary: row[4]
        };
    });

    // Return reversed (newest first)
    return ContentService.createTextOutput(JSON.stringify(logs.reverse()))
        .setMimeType(ContentService.MimeType.JSON);
}
