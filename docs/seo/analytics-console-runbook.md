# Volt analytics production checklist

The website code deliberately sends GA4 data only from the exact `volt.az` hostname and only on public routes. Test, localhost, admin, account, cart, checkout, order, reviewer, and other private traffic is rejected before the Google tag is loaded.

## Before deployment

1. Keep `VITE_ANALYTICS_EXCLUDED_USERS=meta-reviewer` in the production build environment. Add any other reviewer or staff login identifiers as a comma-separated list.
2. Run `npm run lint`, `npm run analytics:verify`, `npm run build`, and `npm run seo:verify`.
3. Use GA4 DebugView on a temporary production test only after deployment. Do not enable analytics on `test.volt.az` to test it.

## GA4 Admin actions

In **Admin → Data display → Events / Key events**:

- Mark `generate_lead`, `quote_request_submit`, `whatsapp_click`, and `phone_click` as key events.
- Keep `calculator_complete` and `email_click` as ordinary events.
- Archive or stop using `ads_conversion_Contact_Us_1` after the new events are confirmed.

In **Admin → Data collection and modification → Data filters**:

- Define and test an internal-traffic rule for Volt office/VPN public IP ranges.
- Keep the filter in **Testing** until its effect is verified, then activate it.
- Do not put private IP addresses in source code.

Campaign parameters such as `utm_source`, `gclid`, and `fbclid` remain available to GA4 attribution, but the emitted `page_path` and `page_location` contain only the canonical path. This avoids splitting one landing page into many rows.

## Acceptance checks

- A successful contact form emits one `generate_lead`; validation errors and failed requests emit none.
- A successful service/quote form emits one `quote_request_submit`.
- WhatsApp, `tel:`, and `mailto:` links emit their matching events. A generic WhatsApp share link is not counted as a lead.
- WhatsApp events include `interaction_type`; use `out_of_stock_check` and `calculator_quote` to separate Yoxla demand from calculator quote interactions. Product identifiers/counts are included where available, while message content, IP addresses, and device IDs remain outside GA4.
- Calculator completion emits `calculator_complete` but no lead.
- `test.volt.az`, localhost, `/admin-dashboard`, `/customer-dashboard`, cart, checkout, and reviewer sessions show no Google tag request.
- Source/medium attribution remains present on the conversion events.
