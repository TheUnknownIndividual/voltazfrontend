import axiosInstance from './axiosInstance';

export interface MetaInboxConversation {
  id: number;
  channel: 'messenger' | 'instagram' | 'whatsapp';
  participantExternalId: string;
  participantDisplayName: string;
  participantAvatarUrl?: string | null;
  assignedAdminUserId?: number | null;
  assignedAdminDisplayName?: string | null;
  status: 'open' | 'closed';
  unreadCount: number;
  lastMessagePreview: string;
  lastMessageAt: string;
}

export interface MetaInboxMessage {
  id: number;
  direction: 'incoming' | 'outgoing';
  text?: string | null;
  attachments: Array<{ type: string; url?: string | null; title?: string | null }>;
  sentByAdminUserId?: number | null;
  sentByAdminDisplayName?: string | null;
  deliveryStatus: string;
  createdAt: string;
}

export interface MetaInboxNote {
  id: number;
  authorAdminUserId: number;
  authorDisplayName: string;
  body: string;
  createdAt: string;
}

export interface MetaInboxAssignee { id: number; displayName: string; }
export interface MetaInboxWebhookDiagnostics {
  startedAtUtc: string;
  lastAttemptAtUtc?: string | null;
  lastCompletedAtUtc?: string | null;
  lastAcceptedAtUtc?: string | null;
  lastResponseStatus?: number | null;
  lastResult: 'waiting' | 'accepted' | 'invalid_signature' | 'not_configured' | 'processing_failed' | 'request_cancelled' | string;
  attemptCount: number;
  acceptedCount: number;
  rejectedCount: number;
  failedCount: number;
  objectType?: string | null;
  field?: string | null;
  phoneNumberId?: string | null;
  messageCount: number;
  statusCount: number;
}
export interface MetaInboxConfiguration {
  enabled: boolean;
  ready: boolean;
  graphApiVersion: string;
  messengerReady: boolean;
  whatsAppReady: boolean;
  canViewAllConversations: boolean;
  canViewWebhookDiagnostics: boolean;
  webhook?: MetaInboxWebhookDiagnostics | null;
}
export interface MetaInboxPage { items: MetaInboxConversation[]; total: number; unreadTotal: number; page: number; pageSize: number; }

export interface WhatsAppOnboardingStatus {
  configured: boolean;
  connected: boolean;
  appId: string;
  configurationId: string;
  redirectUri: string;
  whatsAppBusinessAccountId: string;
  phoneNumberId: string;
  displayPhoneNumber?: string | null;
  verifiedName?: string | null;
  qualityRating?: string | null;
  codeVerificationStatus?: string | null;
  runtimeStatus?: string | null;
  platformType?: string | null;
  accountMode?: string | null;
  appSubscribed: boolean;
  webhookMessagesSubscribed: boolean;
  webhookHistorySubscribed: boolean;
  webhookMessageEchoesSubscribed: boolean;
  webhookAppStateSyncSubscribed: boolean;
  lastError?: string | null;
}

export interface WhatsAppHistorySyncStatus {
  phoneNumberId: string;
  metaRequestId?: string | null;
  status: 'not_requested' | 'requested' | 'processing' | 'completed' | 'declined' | 'failed' | string;
  progress: number;
  phase?: number | null;
  lastChunkOrder?: number | null;
  requestedAt?: string | null;
  completedAt?: string | null;
  updatedAt?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface WhatsAppOnboardingResult {
  connected: boolean;
  requiresPin: boolean;
  continuationToken?: string | null;
  status: WhatsAppOnboardingStatus;
}

const unwrap = <T,>(response: any): T => response.data?.data ?? response.data;

export const getMetaInboxConfiguration = async () => unwrap<MetaInboxConfiguration>(await axiosInstance.get('meta-inbox/configuration'));
export const getMetaInboxConversations = async (params: { search?: string; status?: string; assignment?: string; page?: number; pageSize?: number }) =>
  unwrap<MetaInboxPage>(await axiosInstance.get('meta-inbox/conversations', { params }));
export const getMetaInboxMessages = async (conversationId: number, afterId?: number) =>
  unwrap<MetaInboxMessage[]>(await axiosInstance.get(`meta-inbox/conversations/${conversationId}/messages`, { params: afterId ? { afterId } : undefined }));
export const getMetaInboxNotes = async (conversationId: number, afterId?: number) =>
  unwrap<MetaInboxNote[]>(await axiosInstance.get(`meta-inbox/conversations/${conversationId}/notes`, { params: afterId ? { afterId } : undefined }));
export const getMetaInboxAssignees = async () => unwrap<MetaInboxAssignee[]>(await axiosInstance.get('meta-inbox/assignees'));
export const getMetaInboxUnreadCount = async () => unwrap<number>(await axiosInstance.get('meta-inbox/unread-count'));
export const assignMetaInboxConversation = async (conversationId: number, assignedAdminUserId: number | null) =>
  unwrap<MetaInboxConversation>(await axiosInstance.put(`meta-inbox/conversations/${conversationId}/assignment`, { assignedAdminUserId }));
export const updateMetaInboxConversationStatus = async (conversationId: number, status: 'open' | 'closed') =>
  unwrap<MetaInboxConversation>(await axiosInstance.put(`meta-inbox/conversations/${conversationId}/status`, { status }));
export const markMetaInboxConversationRead = async (conversationId: number) =>
  unwrap<MetaInboxConversation>(await axiosInstance.put(`meta-inbox/conversations/${conversationId}/read`));
export const sendMetaInboxMessage = async (conversationId: number, text: string) =>
  unwrap<MetaInboxMessage>(await axiosInstance.post(`meta-inbox/conversations/${conversationId}/messages`, { text }));
export const addMetaInboxNote = async (conversationId: number, body: string) =>
  unwrap<MetaInboxNote>(await axiosInstance.post(`meta-inbox/conversations/${conversationId}/notes`, { body }));
export const getWhatsAppOnboardingStatus = async () =>
  unwrap<WhatsAppOnboardingStatus>(await axiosInstance.get('meta-inbox/whatsapp-onboarding'));
export const completeWhatsAppOnboarding = async (payload: { code: string; whatsAppBusinessAccountId: string; phoneNumberId: string }) =>
  unwrap<WhatsAppOnboardingResult>(await axiosInstance.post('meta-inbox/whatsapp-onboarding/complete', payload));
export const registerWhatsAppOnboardingPhone = async (continuationToken: string, pin: string) =>
  unwrap<WhatsAppOnboardingResult>(await axiosInstance.post('meta-inbox/whatsapp-onboarding/register', { continuationToken, pin }));
export const getWhatsAppHistorySyncStatus = async () =>
  unwrap<WhatsAppHistorySyncStatus>(await axiosInstance.get('meta-inbox/whatsapp-onboarding/history-sync'));
export const requestWhatsAppHistorySync = async () =>
  unwrap<WhatsAppHistorySyncStatus>(await axiosInstance.post('meta-inbox/whatsapp-onboarding/history-sync'));
