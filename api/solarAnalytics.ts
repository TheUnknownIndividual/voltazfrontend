import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../utils/constants';

export interface SolarProjectOption {
  id: number;
  name: string;
  createdAt: string;
  updatedAt?: string | null;
  latestPayloadJson?: string | null;
  adminTrackedProjectId?: number | null;
}

export interface SolarAnalyticsDashboard {
  summary: {
    totalCalculations: number;
    webCalculations: number;
    adminExports: number;
    whatsappClicks: number;
    documentsIssued: number;
    uniqueProjects: number;
  };
  timeSeries: Array<{ date: string; calculations: number; documents: number; whatsappClicks: number }>;
  documentsByCode: Array<{ key: string; count: number }>;
  sourceBreakdown: Array<{ key: string; count: number }>;
  topProjects: Array<{ projectId: number; projectName: string; calculationCount: number; documentCount: number; lastActivityAt: string }>;
  outOfStockDemand: Array<{
    productId: string;
    productName: string;
    category: string;
    subCategory: string;
    brand: string;
    variant: string;
    initiations: number;
    requestedUnits: number;
    uniqueDevices: number;
    lastInteractionAt: string;
  }>;
  recentActivity: Array<{
    kind: string;
    source: string;
    eventType: string;
    projectName?: string | null;
    documentNumber?: string | null;
    documentCode?: string | null;
    createdAt: string;
    payloadJson?: string | null;
  }>;
}

const getSessionId = () => {
  if (typeof window === 'undefined') {
    return 'server';
  }

  const key = 'volt-solar-analytics-session';
  const existing = window.sessionStorage.getItem(key);
  if (existing) {
    return existing;
  }

  const generated = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem(key, generated);
  return generated;
};

const getDeviceId = () => {
  if (typeof window === 'undefined') {
    return 'server';
  }

  const key = 'volt-analytics-device-id';
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }

  const generated = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(key, generated);
  return generated;
};

const unwrap = <T,>(response: { data: { success?: boolean; data?: T } }) => response.data?.data as T;

export const searchSolarProjects = async (query: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SOLAR_ANALYTICS.SEARCH_PROJECTS(query));
  return unwrap<SolarProjectOption[]>(response) || [];
};

export const logAdminPdfExport = async (projectName: string, language: string, payload: unknown, adminTrackedProjectId: number) => {
  const response = await axiosInstance.post(API_ENDPOINTS.SOLAR_ANALYTICS.ADMIN_PDF_EXPORT, {
    projectName,
    adminTrackedProjectId,
    language,
    sessionId: getSessionId(),
    payload
  });
  return unwrap<{ projectId: number; calculationLogId: number }>(response);
};

export const issueAdminDocxExport = async (projectName: string, documentCode: string, language: string, payload: unknown, adminTrackedProjectId: number) => {
  const response = await axiosInstance.post(API_ENDPOINTS.SOLAR_ANALYTICS.ADMIN_DOCX_EXPORT, {
    projectName,
    documentCode,
    adminTrackedProjectId,
    language,
    sessionId: getSessionId(),
    payload
  });
  return unwrap<{ projectId: number; adminTrackedProjectId: number; calculationLogId: number; documentLogId: number; documentCode: string; documentNumber: string; verificationToken: string; verificationUrl: string }>(response);
};

export const logPublicSolarCalculation = async (language: string, payload: unknown) => {
  const response = await axiosInstance.post(API_ENDPOINTS.SOLAR_ANALYTICS.PUBLIC_CALCULATION, {
    language,
    sessionId: getSessionId(),
    payload
  });
  return unwrap<{ calculationLogId: number }>(response);
};

export const logPublicWhatsappClick = async (language: string, payload: unknown) => {
  const requestBody = {
    language,
    sessionId: getSessionId(),
    deviceId: getDeviceId(),
    interactionId: crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    clientOccurredAt: new Date().toISOString(),
    payload
  };
  const response = await fetch(API_ENDPOINTS.SOLAR_ANALYTICS.PUBLIC_WHATSAPP_CLICK, {
    method: 'POST',
    credentials: 'include',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) throw new Error(`WhatsApp analytics request failed (${response.status}).`);
  const responseBody = await response.json();
  return responseBody?.data as { calculationLogId: number };
};

export const getSolarAnalyticsDashboard = async (from?: string, to?: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SOLAR_ANALYTICS.DASHBOARD(from, to));
  return unwrap<SolarAnalyticsDashboard>(response);
};
