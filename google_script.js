function doGet(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var params = e.parameter;

    // If we have a 'query' parameter, it's a LOGGING request
    if (params.query) {
        var timestamp = new Date().toISOString();

        // Add header if missing (Updated schema)
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(["Timestamp", "IP (Simulated)", "Name (Manual)", "Query", "Top Result", "Intersection", "Location"]);
        }

        sheet.appendRow([
            timestamp,
            "Client",
            params.user || "Anonymous",
            params.query,
            params.topResultSummary || "",
            params.intersection || "",
            params.location || ""
        ]);

        // Return JSON success (wrapped in padding for extra safety if needed, but JSON is fine)
        return ContentService.createTextOutput(JSON.stringify({ status: "logged" }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    // Otherwise, it's a VIEW request (Admin Dashboard)
    var rows = sheet.getDataRange().getValues();

    // Handle empty sheet case
    if (rows.length < 2) {
        return ContentService.createTextOutput(JSON.stringify([]))
            .setMimeType(ContentService.MimeType.JSON);
    }

    var data = rows.slice(1);
    var logs = data.map(function (row) {
        return {
            timestamp: row[0],
            ip: row[1],
            user: row[2],
            query: row[3],
            topResultSummary: row[4],
            intersection: row[5],
            location: row[6]
        };
    });

    return ContentService.createTextOutput(JSON.stringify(logs.reverse()))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    // Fallback to doGet logic if someone sends POST
    // But we will use GET from now on.
    return doGet(e);
}
