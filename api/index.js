export default async function handler(req, res) {
  try {
    // Parse form data from the request body
    const data = await req.json();

    // Log for debugging (optional)
    console.log("Received data:", data);

    // Here’s where you’d check your Google Sheet for duplicates
    // For now, we’ll skip that and just return the payload

    return Response.json({
      success: true,
      tenant_id: data.tenant_id || crypto.randomUUID(),
      site_display_name: data.site_display_name || "",
      subdomain: data.subdomain || "",
      amazon_tag: data.amazon_tag || "",
      email: data.email || "",
      message: "Data received successfully",
    });
  } catch (error) {
    console.error("Error in API:", error);
    return Response.json({ success: false, error: error.message });
  }
}
