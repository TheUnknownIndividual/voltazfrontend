import axiosInstance from './axiosInstance';

export interface ProductDatasheetSource {
  url: string;
  mimeType: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp';
  sizeBytes: number;
  fileName?: string;
}

export interface ProductAiLanguageDraft {
  languageCode: number;
  description: string;
  features: string;
}

export interface ProductAiVariantDraft {
  modelLabel: string;
  technicalPower: string;
  effectiveness: number | null;
  count: number;
  amount: number;
  commercialValuesConfirmed: boolean;
  languages: ProductAiLanguageDraft[];
  evidence: string[];
}

export interface ProductAiDraft {
  productName: string;
  productTechnologyId: number;
  productTechnologyName: string;
  productTechnologyCreated: boolean;
  variants: ProductAiVariantDraft[];
  warnings: string[];
}

export interface ProductAiJob {
  id: string;
  status: 'queued' | 'processing' | 'review_ready' | 'cancelled' | 'expired' | 'failed';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  draft?: ProductAiDraft | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface ProductAiSettings {
  enabled: boolean;
  model: string;
  maxFiles: number;
  maxCombinedBytes: number;
  requestTimeoutSeconds: number;
}

const unwrap = <T>(response: { data?: { success?: boolean; data?: T; error?: unknown } }): T => {
  if (!response.data?.success || response.data.data === undefined) {
    throw new Error('API_REQUEST_FAILED');
  }
  return response.data.data;
};

export const uploadProductDatasheets = async (files: File[]) => {
  const body = new FormData();
  files.forEach((file) => body.append('files', file));
  const response = await axiosInstance.post('Products/datasheets/upload', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap<ProductDatasheetSource[]>(response);
};

export const getProductAiSettings = async () =>
  unwrap<ProductAiSettings>(await axiosInstance.get('Products/ai-imports/settings'));

export const startProductAiImport = async (request: {
  productId?: number;
  productCategoryId: number;
  productSubCategoryId: number;
  productBrandId: number;
  productTechnologyId?: number;
  defaultCount: number;
  defaultAmount: number;
  sources: ProductDatasheetSource[];
}) => unwrap<ProductAiJob>(await axiosInstance.post('Products/ai-imports', request));

export const getProductAiImport = async (jobId: string) =>
  unwrap<ProductAiJob>(await axiosInstance.get(`Products/ai-imports/${jobId}`));

export const cancelProductAiImport = async (jobId: string) =>
  unwrap<ProductAiJob>(await axiosInstance.delete(`Products/ai-imports/${jobId}`));
