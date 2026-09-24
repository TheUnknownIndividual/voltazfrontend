import axiosInstance from './axiosInstance';

export type MarketplaceName = 'lalafo' | 'tapaz';

export const MARKETPLACE_LABELS: Record<MarketplaceName, string> = {
  lalafo: 'Lalafo',
  tapaz: 'Tap.az',
};

export interface MarketplacePreparedItem {
  code: string;
  variantId?: number | null;
  label: string;
  title: string;
  warnings: string[];
}

export interface MarketplaceSkipped {
  variantId?: number | null;
  label: string;
  reason: string;
}

export interface MarketplaceBatch {
  marketplace: MarketplaceName;
  expiresAtUtc: string;
  productName: string;
  items: MarketplacePreparedItem[];
  skipped: MarketplaceSkipped[];
}

export interface MarketplaceListing {
  productId: number;
  variantId?: number | null;
  marketplace: MarketplaceName;
  externalId: string;
  url?: string | null;
  status: 'draft' | 'pending' | 'published';
  updatedAt: string;
}

const unwrap = <T>(response: { data?: { success?: boolean; data?: T; error?: unknown } }): T => {
  if (!response.data?.success || response.data.data === undefined) {
    throw new Error('API_REQUEST_FAILED');
  }
  return response.data.data;
};

// One prepared listing per variant of the product; variants already posted on the marketplace are skipped unless forced.
export const prepareMarketplaceBatch = async (
  productId: number,
  marketplace: MarketplaceName,
  options: { variantIds?: number[]; force?: boolean } = {},
) =>
  unwrap<MarketplaceBatch>(
    await axiosInstance.post(
      'Marketplace/prepare',
      { productId, marketplace, variantIds: options.variantIds ?? [], force: options.force ?? false },
      { timeout: 300000 },
    ),
  );

export const getMarketplaceListings = async (productIds: number[]) => {
  if (productIds.length === 0) return [] as MarketplaceListing[];
  return unwrap<MarketplaceListing[]>(
    await axiosInstance.get('Marketplace/listings', { params: { productIds: productIds.join(',') } }),
  );
};

export const buildMarketplacePostUrl = (marketplace: MarketplaceName, codes: string[], auto: boolean) => {
  const apiBase = String(axiosInstance.defaults.baseURL ?? '').replace(/\/+$/, '');
  const params = new URLSearchParams({ codes: codes.join(','), api: apiBase });
  if (auto) params.set('auto', '1');
  const base = marketplace === 'lalafo' ? 'https://lalafo.az/ad/post' : 'https://tap.az/elanlar/new';
  return `${base}#${params.toString()}`;
};
