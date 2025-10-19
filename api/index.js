return Response.json({
  success: true,
  tenant_id: data.tenant_id,
  site_display_name: data.site_display_name,
  subdomain: data.subdomain,
  amazon_tag: data.amazon_tag,
  email: data.email,
});
