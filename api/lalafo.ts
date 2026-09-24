import axiosInstance from './axiosInstance';

export interface LalafoListingPayload {
  productId: number;
  productName: string;
  categoryId: number;
  categoryLabel: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  warnings: string[];
}

export interface LalafoPreparedListing {
  code: string;
  expiresAtUtc: string;
  payload: LalafoListingPayload;
}

export interface LalafoSettings {
  enabled: boolean;
  categories: { id: number; label: string }[];
}

const unwrap = <T>(response: { data?: { success?: boolean; data?: T; error?: unknown } }): T => {
  if (!response.data?.success || response.data.data === undefined) {
    throw new Error('API_REQUEST_FAILED');
  }
  return response.data.data;
};

export const getLalafoSettings = async () =>
  unwrap<LalafoSettings>(await axiosInstance.get('Lalafo/settings'));

export const prepareLalafoListing = async (productId: number) =>
  unwrap<LalafoPreparedListing>(await axiosInstance.post('Lalafo/prepare', { productId }, { timeout: 180000 }));

export const buildLalafoPostUrl = (code: string) => {
  const apiBase = String(axiosInstance.defaults.baseURL ?? '').replace(/\/+$/, '');
  const params = new URLSearchParams({ volt: code, api: apiBase });
  return `https://lalafo.az/ad/post#${params.toString()}`;
};
