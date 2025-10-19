import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;

  // --- CONFIG ---
  const SPREADSHEET_ID = "1YqMpo0L4tjHKq0gvGXmPQOu_iw5QkppFzy4HtdrD1Eo";
  const SHEET_NAME = "Subscribers";

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_KEY),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 1. Get all subdomains
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!C:C`, // column C holds subdomain
    });

    const existing = getRows.data.values ? getRows.data.values.flat() : [];
    if (existing.includes(body.subdomain)) {
      return res.status(200).json({ error: "duplicate_subdomain" });
    }

    // 2. Append the new record
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          new Date().toISOString(),
          body.tenant_id,
          body.site_display_name,
          body.subdomain,
          body.amazon_tag,
          body.email,
        ]],
      },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "server_error" });
  }
}
