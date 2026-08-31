import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const analytics = fs.readFileSync(path.join(root, 'utils', 'analytics.ts'), 'utf8');
const solarAnalytics = fs.readFileSync(path.join(root, 'api', 'solarAnalytics.ts'), 'utf8');
const productCard = fs.readFileSync(path.join(root, 'components', 'ProductCard.tsx'), 'utf8');
const productDetail = fs.readFileSync(path.join(root, 'components', 'ProductDetail.tsx'), 'utf8');
const cartPage = fs.readFileSync(path.join(root, 'components', 'CartPage.tsx'), 'utf8');

const checks = [
  ['GA is not loaded statically from index.html', !/googletagmanager\.com\/gtag\/js/i.test(indexHtml)],
  ['tracking is restricted to the production hostname', analytics.includes("PRODUCTION_HOSTNAME = 'volt.az'")],
  ['private routes are excluded', ['admin-dashboard', 'customer-dashboard', 'checkout'].every((route) => analytics.includes(route))],
  ['reviewer identities can be excluded', analytics.includes('VITE_ANALYTICS_EXCLUDED_USERS')],
  ['page paths are normalized', analytics.includes('normalizedAnalyticsPath')],
  ['confirmed lead event exists', analytics.includes("'generate_lead'")],
  ['quote event exists', analytics.includes("'quote_request_submit'")],
  ['calculator is not mislabeled as a lead', analytics.includes("'calculator_complete'")],
  ['contact-link events exist', ['whatsapp_click', 'phone_click', 'email_click'].every((event) => analytics.includes(event))],
  ['WhatsApp GA events distinguish Yoxla and calculator quote interactions', analytics.includes('interaction_type: whatsappPayload.interactionType') && analytics.includes('product_count:')],
  ['business WhatsApp clicks are persisted server-side', analytics.includes('logPublicWhatsappClick(currentLanguage(target)')],
  ['WhatsApp delivery uses a keepalive request', solarAnalytics.includes('keepalive: true')],
  ['WhatsApp events include pseudonymous device and interaction IDs', ['volt-analytics-device-id', 'interactionId', 'clientOccurredAt'].every((value) => solarAnalytics.includes(value))],
  ['out-of-stock product demand is tagged at every product entry point', [productCard, productDetail, cartPage].every((source) => source.includes('data-whatsapp-interaction="out_of_stock_check"'))],
];

let failed = false;
for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);
  failed ||= !passed;
}

if (failed) process.exitCode = 1;
