// BagThat — API Endpoint (Self-contained, Google Sheets Integrated)
// Handles onboarding form submissions directly from Vercel frontend.

import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;

  // ====== GOOGLE SHEET CONFIG ======
  const SPREADSHEET_ID = "1YqMpo0L4tjHKq0gvGXmPQOu_iw5QkppFzy4HtdrD1Eo";
  const SHEET_NAME = "Subscribers";

  // ====== GOOGLE AUTH CREDENTIALS (Insert your JSON here) ======
  // Replace these values with the contents of your service account key JSON file.
  const GOOGLE_SERVICE_KEY = {
    type: "service_account",
    project_id: "your-project-id",
    private_key_id: "YOUR_PRIVATE_KEY_ID",
    private_key: "-----BEGIN PRIVATE KEY-----\nYOUR_KEY_CONTENTS\n-----END PRIVATE KEY-----\n",
    client_email: "your-service-account@your-project-id.iam.gserviceaccount.com",
    client_id: "YOUR_CLIENT_ID",
    universe_domain: "googleapis.com"
  };

  try {
    // ====== AUTHENTICATE TO GOOGLE SHEETS ======
    const auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SERVICE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ====== CHECK FOR DUPLICATE SUBDOMAIN ======
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!D:D` // Column D = subdomain
    });

    const existing = getRows.data.values ? getRows.data.values.flat() : [];
    if (existing.includes(body.subdomain)) {
      return res.status(200).json({ error: "duplicate_subdomain" });
    }

    // ====== APPEND NEW RECORD ======
    const timestamp = new Date().toISOString();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          timestamp,
          body.tenant_id,
          body.site_display_name,
          body.subdomain,
          body.amazon_tag,
          body.email
        ]]
      }
    });

    // ====== SUCCESS RESPONSE ======
    return res.status(200).json({
      success: true,
      subdomain: body.subdomain,
      link: `https://${body.subdomain}.bagthatthangup.com`
    });

  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: "server_error", details: err.message });
  }
}
