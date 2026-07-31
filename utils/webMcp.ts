import axiosInstance from '../api/axiosInstance';

type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, any>) => Promise<Record<string, unknown>>;
};

type WebMcpContext = { tools: WebMcpTool[] };

declare global {
  interface Navigator {
    modelContext?: { provideContext?: (context: WebMcpContext) => void | Promise<void> };
  }
}

const unwrap = <T,>(payload: any): T => {
  if (!payload?.success || payload.data === undefined) throw new Error(payload?.error?.details || 'Volt.az could not complete this request.');
  return payload.data as T;
};

function estimate(input: Record<string, any>) {
  const monthlyBillAzn = Number(input.monthlyBillAzn);
  if (!Number.isFinite(monthlyBillAzn) || monthlyBillAzn <= 0 || monthlyBillAzn > 1_000_000) throw new Error('monthlyBillAzn must be a positive number.');
  const yieldByCity: Record<string, number> = { Bakı: 1380, Sumqayıt: 1370, Gəncə: 1340, Şamaxı: 1360, Naxçıvan: 1460, default: 1380 };
  const city = String(input.city || 'Bakı');
  const annualConsumption = (monthlyBillAzn / 0.15) * 12;
  const productionYield = yieldByCity[city] || yieldByCity.default;
  const panelCount = Math.max(1, Math.ceil(((annualConsumption / productionYield) * 1000) / 650));
  const powerKwp = Number(((panelCount * 650) / 1000).toFixed(1));
  return {
    disclaimer: 'Planning estimate only. Volt.az must confirm the design and final price.',
    city,
    systemPowerKwp: powerKwp,
    panelCount,
    estimatedAnnualProductionKwh: Math.round(powerKwp * productionYield),
    requiredRoofAreaM2: Math.round(panelCount * 2.7),
  };
}

/**
 * WebMCP is an early-preview browser API. This is intentionally feature-gated:
 * on every normal browser it is a no-op and the existing website is unchanged.
 */
export async function registerPublicWebMcp(): Promise<void> {
  if (typeof window === 'undefined' || typeof navigator.modelContext?.provideContext !== 'function') return;

  const tools: WebMcpTool[] = [
    {
      name: 'search_public_products',
      description: 'Search only products and availability currently visible to ordinary Volt.az visitors.',
      inputSchema: { type: 'object', properties: { query: { type: 'string', maxLength: 120 }, page: { type: 'integer', minimum: 1 }, pageSize: { type: 'integer', minimum: 1, maximum: 50 } } },
      execute: async (input) => unwrap(await axiosInstance.get('public-agent/products', { params: input }).then((response) => response.data)),
    },
    {
      name: 'get_public_product_details',
      description: 'Read public product specifications, price, documents, images, and public availability. Warehouse quantities are never exposed.',
      inputSchema: { type: 'object', properties: { productId: { type: 'integer', minimum: 1 } }, required: ['productId'] },
      execute: async (input) => unwrap(await axiosInstance.get(`public-agent/products/${Number(input.productId)}`).then((response) => response.data)),
    },
    {
      name: 'estimate_public_solar_system',
      description: 'Return a non-binding public solar-system estimate.',
      inputSchema: { type: 'object', properties: { monthlyBillAzn: { type: 'number', minimum: 1 }, city: { type: 'string', maxLength: 64 } }, required: ['monthlyBillAzn'] },
      execute: async (input) => estimate(input),
    },
    {
      name: 'prepare_contact_request',
      description: 'Prepare a short-lived contact-request draft and open Volt.az for the visitor to review and explicitly confirm. This tool cannot submit the request.',
      inputSchema: { type: 'object', properties: { name: { type: 'string' }, surname: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, message: { type: 'string' }, applicationTypeId: { type: 'integer', minimum: 1 } }, required: ['name', 'surname', 'email', 'phone', 'message', 'applicationTypeId'] },
      execute: async (input) => {
        const draft = unwrap<{ confirmationUrl: string; expiresAt: string; status: string }>(await axiosInstance.post('public-agent/contact-drafts', { ...input, source: 'webmcp', website: '' }).then((response) => response.data));
        // The browser opens the review screen; it never posts confirmation itself.
        window.open(draft.confirmationUrl, '_blank', 'noopener,noreferrer');
        return { status: draft.status, expiresAt: draft.expiresAt, confirmationUrl: draft.confirmationUrl, nextStep: 'The visitor must review and click Confirm and send on Volt.az.' };
      },
    },
  ];

  await navigator.modelContext.provideContext({ tools });
}
