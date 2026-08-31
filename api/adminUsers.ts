import axiosInstance from './axiosInstance';

export enum AdminPage {
  Stats = 1,
  Analytics,
  Orders,
  Requests,
  ServiceRequests,
  PartnershipRequests,
  Warehouse,
  SolarCalculator,
  ProjectTracker,
  Projects,
  Settings,
  Users,
  Verification,
  ExecutionProjects,
  Accounting,
  SolarInverterQa,
  MessageInbox,
  WhatsAppOnboarding
}

export interface AdminUser {
  id: number;
  username: string;
  displayName: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  canDeleteProjects: boolean;
  canEditProjects: boolean;
  canApproveWarehouseMovements: boolean;
  isStakeholder: boolean;
  hasSalary: boolean;
  canViewAccounting?: boolean;
  telegramChatId?: number | null;
  allowedPages: AdminPage[];
}

export interface AdminActivity {
  id: number;
  action: string;
  targetType?: string;
  targetId?: string;
  summary?: string;
  succeeded: boolean;
  createdAt: string;
}

const unwrap = <T,>(response: any): T => response.data?.data ?? response.data;

export const getAdminSession = async () => unwrap<AdminUser>(await axiosInstance.get('Admins/me'));
export const getAdminUsers = async () => unwrap<AdminUser[]>(await axiosInstance.get('Admins'));
export const createAdminUser = async (payload: {
  username: string;
  password: string;
  displayName: string;
  allowedPages: AdminPage[];
  canDeleteProjects: boolean;
  canEditProjects: boolean;
  canApproveWarehouseMovements: boolean;
  isStakeholder: boolean;
  monthlySalary?: number | null;
  telegramChatId?: number | null;
}) => unwrap<AdminUser>(await axiosInstance.post('Admins/create', payload));
export const updateAdminAccess = async (id: number, payload: {
  displayName: string;
  isActive: boolean;
  allowedPages: AdminPage[];
  canDeleteProjects: boolean;
  canEditProjects: boolean;
  canApproveWarehouseMovements: boolean;
  isStakeholder: boolean;
  monthlySalary?: number | null;
  telegramChatId?: number | null;
  clearSalary?: boolean;
}) => unwrap<AdminUser>(await axiosInstance.put(`Admins/${id}/access`, payload));
export const resetAdminPassword = async (id: number, password: string) => axiosInstance.put(`Admins/${id}/password`, { newPassword: password });
export const deleteAdminUser = async (id: number) => axiosInstance.delete(`Admins/${id}`);
export const getAdminActivity = async (id: number, page = 1) => unwrap<{ items: AdminActivity[]; totalCount: number }>(await axiosInstance.get(`Admins/${id}/activity`, { params: { page, pageSize: 25 } }));
