import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../utils/constants';

export type ProjectMountType = 'roof' | 'ground';

export interface ProjectOffer {
  id?: number;
  power: string;
  mountType: ProjectMountType;
  areaType: string;
  extraAmount: string;
  sentAt: string;
}

export interface ProjectAttachment {
  id?: number;
  name: string;
  label?: string;
  tag?: 'Qiymət təklifi' | 'Banka müraciət sənədi';
  filePath: string;
  createdAt?: string;
  documentExtractionStatus?: string;
}

export type ProjectSystemType = 1 | 2 | 3;

export interface TrackedProject {
  id: string;
  name: string;
  offers: ProjectOffer[];
  location?: string;
  personName?: string;
  phoneNumber?: string;
  systemType?: ProjectSystemType | null;
  inquiryReceivedAt?: string;
  offerSentAt?: string;
  responseExpectedAt?: string;
  currentStatus?: string;
  stakeholderApprovalStatus?: string;
  stakeholderApprovalRequestedAt?: string | null;
  stakeholderApprovalResolvedAt?: string | null;
  stakeholderApprovalRequestId?: number | null;
  stakeholderApprovalDeliveredRecipientCount?: number;
  stakeholderApprovalFailedRecipientCount?: number;
  smallNote?: string;
  offerPrice?: number;
  isOfferPriceManual?: boolean;
  includesAdv?: boolean;
  description?: string;
  attachments: ProjectAttachment[];
  createdAt: string;
  updatedAt?: string;
}

const unwrap = <T,>(response: { data: { success?: boolean; data?: T } }) => response.data?.data as T;

const toDateInput = (value?: string | null) => {
  if (!value) return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value).slice(0, 10) : parsed.toISOString().slice(0, 10);
};

const toNumber = (value: string) => Number(String(value || '').replace(',', '.')) || 0;

const mapProject = (item: any): TrackedProject => ({
  id: String(item.id),
  name: item.name || '',
  offers: Array.isArray(item.offers) && item.offers.length > 0
    ? item.offers.map((offer: any) => ({
      id: offer.id,
      power: offer.power === undefined || offer.power === null ? '' : String(offer.power),
      mountType: offer.mountType === 'ground' ? 'ground' : 'roof',
      areaType: offer.areaType || '',
      extraAmount: offer.extraAmount ? String(offer.extraAmount) : '',
      sentAt: toDateInput(offer.sentAt),
    }))
    : [],
  location: item.location || '',
  personName: item.personName || '',
  phoneNumber: item.phoneNumber || '',
  systemType: item.systemType === 1 || item.systemType === 2 || item.systemType === 3 ? item.systemType : null,
  inquiryReceivedAt: toDateInput(item.inquiryReceivedAt),
  offerSentAt: toDateInput(item.offerSentAt),
  responseExpectedAt: toDateInput(item.responseExpectedAt),
  currentStatus: item.currentStatus || '',
  stakeholderApprovalStatus: item.stakeholderApprovalStatus || 'NotRequired',
  stakeholderApprovalRequestedAt: item.stakeholderApprovalRequestedAt || null,
  stakeholderApprovalResolvedAt: item.stakeholderApprovalResolvedAt || null,
  stakeholderApprovalRequestId: item.stakeholderApprovalRequestId ?? null,
  stakeholderApprovalDeliveredRecipientCount: Number(item.stakeholderApprovalDeliveredRecipientCount || 0),
  stakeholderApprovalFailedRecipientCount: Number(item.stakeholderApprovalFailedRecipientCount || 0),
  smallNote: item.smallNote || '',
  offerPrice: Number(item.offerPrice || 0),
  isOfferPriceManual: Boolean(item.isOfferPriceManual),
  includesAdv: Boolean(item.includesAdv),
  description: item.description || '',
  attachments: Array.isArray(item.attachments)
    ? item.attachments.map((attachment: any) => ({
      id: attachment.id,
      name: attachment.fileName || attachment.name || 'Document.pdf',
      filePath: attachment.filePath || '',
      label: attachment.label || '',
      tag: attachment.tag === 'Banka müraciət sənədi' ? 'Banka müraciət sənədi' : 'Qiymət təklifi',
      createdAt: attachment.createdAt || '',
      documentExtractionStatus: attachment.documentExtractionStatus || 'NotRequired',
    }))
    : [],
  createdAt: item.createdAt || new Date().toISOString(),
  updatedAt: item.updatedAt || item.createdAt || '',
});

const mapPayload = (project: Omit<TrackedProject, 'id' | 'createdAt' | 'updatedAt'>) => ({
  name: project.name,
  offers: project.offers.map((offer) => ({
    power: toNumber(offer.power),
    mountType: offer.mountType,
    areaType: offer.areaType,
    extraAmount: toNumber(offer.extraAmount),
    sentAt: offer.sentAt || null,
  })),
  location: project.location || '',
  personName: project.personName || '',
  phoneNumber: project.phoneNumber || '',
  systemType: project.systemType ?? null,
  inquiryReceivedAt: project.inquiryReceivedAt || null,
  offerSentAt: project.offerSentAt || null,
  responseExpectedAt: project.responseExpectedAt || null,
  currentStatus: project.currentStatus || '',
  smallNote: project.smallNote || '',
  offerPrice: Number(project.offerPrice || 0),
  isOfferPriceManual: false,
  // ƏDV is mandatory for tracked-project offers. Retain the wire field for
  // API compatibility, but do not expose it as a per-project choice.
  includesAdv: true,
  description: project.description || '',
  attachments: project.attachments.map((attachment) => ({
    fileName: attachment.name,
    filePath: attachment.filePath,
    label: attachment.label || '',
    tag: attachment.tag === 'Banka müraciət sənədi' ? 'Banka müraciət sənədi' : 'Qiymət təklifi',
  })),
});

export const getAdminTrackedProjects = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.ADMIN_PROJECT_TRACKER.GET_PROJECTS);
  return (unwrap<any[]>(response) || []).map(mapProject);
};

export const createAdminTrackedProject = async (project: Omit<TrackedProject, 'id' | 'createdAt' | 'updatedAt'>) => {
  const response = await axiosInstance.post(API_ENDPOINTS.ADMIN_PROJECT_TRACKER.CREATE_PROJECT, mapPayload(project));
  return mapProject(unwrap<any>(response));
};

export const updateAdminTrackedProject = async (id: string, project: Omit<TrackedProject, 'id' | 'createdAt' | 'updatedAt'>) => {
  const response = await axiosInstance.put(API_ENDPOINTS.ADMIN_PROJECT_TRACKER.UPDATE_PROJECT(id), mapPayload(project));
  return mapProject(unwrap<any>(response));
};

export const requestStakeholderReview = async (id: string) => mapProject(unwrap<any>(await axiosInstance.post(`AdminProjectTracker/${id}/stakeholder-review-request`)));
export const retryStakeholderApproval = async (id: string) => mapProject(unwrap<any>(await axiosInstance.post(`AdminProjectTracker/${id}/stakeholder-approval-retry`)));

export const addAdminTrackedProjectAttachment = async (id: string, attachment: { fileName: string; filePath: string; label?: string }) => {
  const response = await axiosInstance.post(`adminprojecttracker/${id}/attachments`, attachment);
  return mapProject(unwrap<any>(response));
};

export const deleteAdminTrackedProject = async (id: string) => {
  await axiosInstance.delete(API_ENDPOINTS.ADMIN_PROJECT_TRACKER.DELETE_PROJECT(id));
};
