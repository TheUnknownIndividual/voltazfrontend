import axiosInstance from './axiosInstance';

export type MarketplaceName = 'lalafo' | 'tapaz';

export const MARKETPLACE_LABELS: Record<MarketplaceName, string> = {
  lalafo: 'Lalafo',
  tapaz: 'Tap.az',
};

export interface MarketplacePrepared {
  code: string;
  marketplace: MarketplaceName;
  expiresAtUtc: string;
  productName: string;
  title: string;
  warnings: string[];
}

export interface MarketplaceListing {
  productId: number;
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

export const prepareMarketplaceListing = async (productId: number, marketplace: MarketplaceName) =>
  unwrap<MarketplacePrepared>(
    await axiosInstance.post('Marketplace/prepare', { productId, marketplace }, { timeout: 180000 }),
  );

export const getMarketplaceListings = async (productIds: number[]) => {
  if (productIds.length === 0) return [] as MarketplaceListing[];
  return unwrap<MarketplaceListing[]>(
    await axiosInstance.get('Marketplace/listings', { params: { productIds: productIds.join(',') } }),
  );
};

export const buildMarketplacePostUrl = (marketplace: MarketplaceName, code: string) => {
  const apiBase = String(axiosInstance.defaults.baseURL ?? '').replace(/\/+$/, '');
  const params = new URLSearchParams({ volt: code, api: apiBase });
  const base = marketplace === 'lalafo' ? 'https://lalafo.az/ad/post' : 'https://tap.az/elanlar/new';
  return `${base}#${params.toString()}`;
};
