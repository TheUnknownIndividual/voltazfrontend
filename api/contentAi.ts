import axiosInstance from './axiosInstance';

export type ContentAiContentType = 'blog' | 'news';

export interface ContentAiLanguageDraft {
  languageCode: number; // 1=az 2=en 3=ru 4=tr
  title: string;
  description: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

export interface ContentAiDraft {
  contentType: ContentAiContentType;
  languages: ContentAiLanguageDraft[];
  warnings: string[];
  shillMentionIncluded: boolean;
}

export interface ContentAiJob {
  id: string;
  contentType: ContentAiContentType;
  status: 'queued' | 'processing' | 'review_ready' | 'cancelled' | 'expired' | 'failed';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  draft?: ContentAiDraft | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface ContentAiSettings {
  enabled: boolean;
  model: string;
  requestTimeoutSeconds: number;
  minTopicLength: number;
  maxTopicLength: number;
  maxAngleNotesLength: number;
}

const unwrap = <T>(response: { data?: { success?: boolean; data?: T; error?: unknown } }): T => {
  if (!response.data?.success || response.data.data === undefined) {
    throw new Error('API_REQUEST_FAILED');
  }
  return response.data.data;
};

export const getContentAiSettings = async (contentType: ContentAiContentType) =>
  unwrap<ContentAiSettings>(await axiosInstance.get('ContentAi/settings', { params: { contentType } }));

export const startContentAiGeneration = async (request: {
  contentType: ContentAiContentType;
  contentId?: number;
  topic: string;
  angleNotes?: string;
  includeShillMention: boolean;
}) => unwrap<ContentAiJob>(await axiosInstance.post('ContentAi/generate', request));

export const getContentAiGeneration = async (jobId: string) =>
  unwrap<ContentAiJob>(await axiosInstance.get(`ContentAi/${jobId}`));

export const cancelContentAiGeneration = async (jobId: string) =>
  unwrap<ContentAiJob>(await axiosInstance.delete(`ContentAi/${jobId}`));
