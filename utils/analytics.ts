import { logPublicWhatsappClick } from '../api/solarAnalytics';

const GA_MEASUREMENT_ID = 'G-YW42320C1M';
const PRODUCTION_HOSTNAME = 'volt.az';
const EXCLUDED_USER_STORAGE_KEY = 'volt-analytics-disabled-user';

const PRIVATE_ROUTE_PATTERN = /^\/(?:(?:az|en|ru|tr)\/)?(?:admin-dashboard|customer-dashboard|pro-club\/dashboard|cart|checkout|order|theme-lab|contact\/confirm)(?:\/|$)/i;
const EXCLUDED_IDENTITIES = new Set(
  (import.meta.env.VITE_ANALYTICS_EXCLUDED_USERS || 'meta-reviewer')
    .split(',')
    .map((value) => value.trim().toLocaleLowerCase())
    .filter(Boolean),
);

type AnalyticsEventParameters = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let analyticsInitialized = false;
let analyticsDisabledForUser = false;
let lastPageViewKey = '';
const emittedDedupeKeys = new Set<string>();

const currentPathname = () => window.location.pathname.replace(/\/{2,}/g, '/') || '/';

const isTrackablePublicPage = (pathname = currentPathname()) => {
  const hostname = window.location.hostname.toLocaleLowerCase();
  return (hostname === PRODUCTION_HOSTNAME || hostname === `test.${PRODUCTION_HOSTNAME}`)
    && !PRIVATE_ROUTE_PATTERN.test(pathname)
    && !analyticsDisabledForUser
    && sessionStorage.getItem(EXCLUDED_USER_STORAGE_KEY) !== '1';
};

export const isPublicProductionPage = (pathname = currentPathname()) => (
  window.location.hostname.toLocaleLowerCase() === PRODUCTION_HOSTNAME
  && !PRIVATE_ROUTE_PATTERN.test(pathname)
  && !analyticsDisabledForUser
  && sessionStorage.getItem(EXCLUDED_USER_STORAGE_KEY) !== '1'
);

export const normalizedAnalyticsPath = (pathname = currentPathname()) => {
  const normalized = pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '');
  return normalized || '/';
};

const ensureAnalytics = () => {
  if (!isPublicProductionPage() || analyticsInitialized) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    transport_type: 'beacon',
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.dataset.voltAnalytics = 'true';
  document.head.appendChild(script);
  analyticsInitialized = true;
};

const emit = (eventName: string, parameters: AnalyticsEventParameters, dedupeKey?: string) => {
  if (!isPublicProductionPage()) return;
  if (dedupeKey && emittedDedupeKeys.has(dedupeKey)) return;

  ensureAnalytics();
  if (!window.gtag) return;

  if (dedupeKey) emittedDedupeKeys.add(dedupeKey);
  window.gtag('event', eventName, {
    ...parameters,
    page_path: normalizedAnalyticsPath(),
  });
};

export const setAnalyticsIdentity = (identity?: string | null) => {
  const normalized = String(identity || '').trim().toLocaleLowerCase();
  analyticsDisabledForUser = Boolean(normalized && EXCLUDED_IDENTITIES.has(normalized));

  if (analyticsDisabledForUser) {
    sessionStorage.setItem(EXCLUDED_USER_STORAGE_KEY, '1');
  } else if (!normalized) {
    sessionStorage.removeItem(EXCLUDED_USER_STORAGE_KEY);
  }
};

export const trackPageView = (language: string) => {
  if (!isPublicProductionPage()) return;
  const pagePath = normalizedAnalyticsPath();
  const pageViewKey = `${pagePath}:${language}`;
  if (pageViewKey === lastPageViewKey) return;

  lastPageViewKey = pageViewKey;
  emit('page_view', {
    page_title: document.title,
    page_location: `${window.location.origin}${pagePath}`,
    language,
  });
};

export const trackConfirmedLead = (
  eventName: 'generate_lead' | 'quote_request_submit',
  leadType: string,
  language: string,
  requestId?: string | number,
) => {
  const dedupeKey = requestId === undefined
    ? undefined
    : `${eventName}:${leadType}:${requestId}`;

  emit(eventName, {
    lead_type: leadType,
    language,
  }, dedupeKey);
};

export const trackWhatsappInteraction = (
  payload: {
    interactionType: string;
    placement: string;
    product?: { id?: string | number; name?: string; category?: string | number };
    products?: Array<{ id?: string | number; name?: string; category?: string | number }>;
  },
  language: string,
) => {
  const firstProduct = payload.product || payload.products?.[0];
  emit('whatsapp_click', {
    link_type: 'whatsapp',
    placement: payload.placement,
    interaction_type: payload.interactionType,
    product_id: firstProduct?.id === undefined ? undefined : String(firstProduct.id),
    product_name: firstProduct?.name,
    product_category: firstProduct?.category === undefined ? undefined : String(firstProduct.category),
    product_count: payload.products?.length || (payload.product ? 1 : 0),
    language,
  });
};

export const trackCalculatorComplete = (
  language: string,
  propertyType: string,
  systemType: string,
  estimatedPower: number,
) => {
  const roundedPower = Math.max(0, Math.round(estimatedPower));
  const powerBucket = roundedPower < 5 ? 'under_5kw'
    : roundedPower < 10 ? '5_9kw'
      : roundedPower < 20 ? '10_19kw'
        : roundedPower < 50 ? '20_49kw'
          : '50kw_plus';

  emit('calculator_complete', {
    language,
    property_type: propertyType,
    system_type: systemType,
    power_bucket: powerBucket,
  }, `calculator_complete:${normalizedAnalyticsPath()}`);
};

const classifyContactLink = (anchor: HTMLAnchorElement) => {
  const rawHref = anchor.getAttribute('href')?.trim() || '';
  if (/^tel:/i.test(rawHref)) return 'phone_click';
  if (/^mailto:/i.test(rawHref)) return 'email_click';

  try {
    const url = new URL(rawHref, window.location.href);
    const isWhatsAppHost = /(^|\.)(wa\.me|whatsapp\.com)$/i.test(url.hostname);
    const targetsBusinessNumber = /\/\d{7,}/.test(url.pathname);
    return isWhatsAppHost && targetsBusinessNumber ? 'whatsapp_click' : null;
  } catch {
    return null;
  }
};

const trimmedDatasetValue = (value: string | undefined, maxLength = 300) => {
  const normalized = String(value || '').trim();
  return normalized ? normalized.slice(0, maxLength) : undefined;
};

const parseWhatsappProducts = (value: string | undefined) => {
  if (!value || value.length > 8_000) return undefined;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return undefined;
    return parsed.slice(0, 20).map((item) => ({
      id: trimmedDatasetValue(item?.id, 100),
      name: trimmedDatasetValue(item?.name, 300),
      category: trimmedDatasetValue(item?.category, 200),
      subCategory: trimmedDatasetValue(item?.subCategory, 200),
      brand: trimmedDatasetValue(item?.brand, 200),
      variant: trimmedDatasetValue(item?.variant, 150),
      requestedQuantity: Number.isFinite(Number(item?.requestedQuantity)) ? Math.max(0, Number(item.requestedQuantity)) : undefined,
      availableStock: Number.isFinite(Number(item?.availableStock)) ? Math.max(0, Number(item.availableStock)) : undefined,
    }));
  } catch {
    return undefined;
  }
};

const parseWhatsappContext = (value: string | undefined) => {
  if (!value || value.length > 16_000) return undefined;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const getWhatsappInteractionPayload = (anchor: HTMLAnchorElement) => {
  const url = new URL(anchor.getAttribute('href') || '', window.location.href);
  const prefilledMessage = (url.searchParams.get('text') || '').trim().slice(0, 2_000);
  const products = parseWhatsappProducts(anchor.dataset.whatsappProducts);
  const productName = trimmedDatasetValue(anchor.dataset.whatsappProductName);
  const product = productName ? {
    id: trimmedDatasetValue(anchor.dataset.whatsappProductId, 100),
    name: productName,
    category: trimmedDatasetValue(anchor.dataset.whatsappProductCategory, 200),
    subCategory: trimmedDatasetValue(anchor.dataset.whatsappProductSubcategory, 200),
    brand: trimmedDatasetValue(anchor.dataset.whatsappProductBrand, 200),
    variant: trimmedDatasetValue(anchor.dataset.whatsappProductVariant, 150),
    requestedQuantity: Number.isFinite(Number(anchor.dataset.whatsappRequestedQuantity))
      ? Math.max(0, Number(anchor.dataset.whatsappRequestedQuantity))
      : undefined,
    availableStock: Number.isFinite(Number(anchor.dataset.whatsappAvailableStock))
      ? Math.max(0, Number(anchor.dataset.whatsappAvailableStock))
      : undefined,
  } : undefined;

  return {
    schemaVersion: 1,
    interactionType: trimmedDatasetValue(anchor.dataset.whatsappInteraction, 80) || 'whatsapp_contact',
    placement: trimmedDatasetValue(anchor.dataset.analyticsPlacement, 120) || 'public_site',
    page: {
      path: normalizedAnalyticsPath(),
      title: document.title.slice(0, 300),
    },
    linkLabel: (anchor.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
    prefilledMessage: prefilledMessage || undefined,
    product,
    products,
    context: parseWhatsappContext(anchor.dataset.whatsappContext),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };
};

const currentLanguage = (anchor: HTMLAnchorElement) => (
  trimmedDatasetValue(anchor.dataset.whatsappLanguage, 10)
  || trimmedDatasetValue(document.documentElement.lang, 10)
  || trimmedDatasetValue(window.localStorage.getItem('lang') || undefined, 10)
  || 'az'
);

export const initializeAnalytics = () => {
  if (typeof window === 'undefined') return () => undefined;

  ensureAnalytics();
  const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!(target instanceof HTMLAnchorElement)) return;

    const eventName = classifyContactLink(target);
    if (!eventName) return;
    const whatsappPayload = eventName === 'whatsapp_click'
      ? getWhatsappInteractionPayload(target)
      : null;
    if (whatsappPayload) {
      trackWhatsappInteraction(whatsappPayload, currentLanguage(target));
    } else {
      emit(eventName, {
        link_type: eventName.replace('_click', ''),
        placement: target.dataset.analyticsPlacement || 'public_site',
      });
    }

    if (whatsappPayload && isTrackablePublicPage()) {
      logPublicWhatsappClick(currentLanguage(target), whatsappPayload).catch(() => undefined);
    }
  };

  document.addEventListener('click', handleDocumentClick, { capture: true });
  return () => document.removeEventListener('click', handleDocumentClick, { capture: true });
};
