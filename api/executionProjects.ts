import axiosInstance from './axiosInstance';

export interface ExecutionAdmin { id: number; displayName: string; }
export interface ExecutionSourceProject { id: number; name: string; }
export interface ExecutionProductVariant { id: number; label: string; inStockQuantity: number; }
export interface ExecutionProduct { id: number; name: string; inStockQuantity: number; variants: ExecutionProductVariant[]; }
export interface ExecutionBootstrap { activeProjects: ExecutionSourceProject[]; adminUsers: ExecutionAdmin[]; products: ExecutionProduct[]; }
export interface ExecutionStaff { id: number; adminUserId: number; displayName: string; roleName: string; startDate?: string | null; endDate?: string | null; }
export interface ExecutionExternalWorker { id: number; firstName: string; lastName: string; startDate: string; endDate: string; amountPaid?: number | null; note: string; }
export interface ExecutionBoqItem { id: number; productId?: number | null; itemName: string; unit: string; plannedQuantity: number; unitCost?: number | null; note: string; }
export interface ExecutionMovement { id: number; productId?: number | null; productParametrId?: number | null; itemName: string; unit: string; quantity: number; direction: 'OUT' | 'IN'; movedAt: string; recordedByName: string; approvalStatus: 'Pending' | 'Approved' | 'Rejected'; approvedByName?: string | null; approvedAt?: string | null; approvalNote: string; }
export interface ExecutionTask { id: number; assignedAdminUserId: number; assignedToName: string; title: string; description: string; dueAt?: string | null; status: 'Assigned' | 'Completed'; notificationStatus: string; createdAt: string; completedAt?: string | null; }
export interface ExecutionProject { id: number; projectId?: number | null; adminTrackedProjectId?: number | null; projectName: string; location?: string; description?: string; sourceOfferPrice?: number | null; projectManagerAdminUserId: number; projectManagerName: string; status: string; plannedStartDate?: string | null; plannedEndDate?: string | null; staff: ExecutionStaff[]; externalWorkers: ExecutionExternalWorker[]; boqItems: ExecutionBoqItem[]; warehouseMovements: ExecutionMovement[]; tasks: ExecutionTask[]; }

const unwrap = <T,>(response: any) => response.data?.data as T;
const base = 'ExecutionProjects';

export const getExecutionBootstrap = async () => unwrap<ExecutionBootstrap>(await axiosInstance.get(`${base}/bootstrap`));
export const getExecutionProjects = async () => unwrap<ExecutionProject[]>(await axiosInstance.get(base));
export const createExecutionProject = async (payload: any) => unwrap<ExecutionProject>(await axiosInstance.post(base, payload));
export const addExecutionStaff = async (id: number, payload: any) => unwrap<ExecutionProject>(await axiosInstance.post(`${base}/${id}/staff`, payload));
export const removeExecutionStaff = async (id: number, staffId: number) => unwrap<ExecutionProject>(await axiosInstance.delete(`${base}/${id}/staff/${staffId}`));
export const addExecutionExternalWorker = async (id: number, payload: any) => unwrap<ExecutionProject>(await axiosInstance.post(`${base}/${id}/external-workers`, payload));
export const removeExecutionExternalWorker = async (id: number, workerId: number) => unwrap<ExecutionProject>(await axiosInstance.delete(`${base}/${id}/external-workers/${workerId}`));
export const addExecutionBoq = async (id: number, payload: any) => unwrap<ExecutionProject>(await axiosInstance.post(`${base}/${id}/boq`, payload));
export const updateExecutionBoq = async (id: number, boqItemId: number, payload: any) => unwrap<ExecutionProject>(await axiosInstance.put(`${base}/${id}/boq/${boqItemId}`, payload));
export const removeExecutionBoq = async (id: number, boqItemId: number) => unwrap<ExecutionProject>(await axiosInstance.delete(`${base}/${id}/boq/${boqItemId}`));
export const prefillExecutionBoq = async (id: number) => unwrap<ExecutionProject>(await axiosInstance.post(`${base}/${id}/boq/prefill`));
export const updateExecutionProject = async (id: number, payload: any) => unwrap<ExecutionProject>(await axiosInstance.put(`${base}/${id}`, payload));
export const addExecutionMovement = async (id: number, payload: any) => unwrap<ExecutionProject>(await axiosInstance.post(`${base}/${id}/warehouse-movements`, payload));
export const approveExecutionMovement = async (id: number, movementId: number, approved: boolean, note = '') => unwrap<ExecutionProject>(await axiosInstance.post(`${base}/${id}/warehouse-movements/${movementId}/approval`, { approved, note }));
export const addExecutionTask = async (id: number, payload: any) => unwrap<ExecutionProject>(await axiosInstance.post(`${base}/${id}/tasks`, payload));
export const completeExecutionTask = async (id: number, taskId: number) => unwrap<ExecutionProject>(await axiosInstance.post(`${base}/${id}/tasks/${taskId}/complete`));
export const retryTaskNotification = async (id: number, taskId: number) => unwrap<ExecutionProject>(await axiosInstance.post(`${base}/${id}/tasks/${taskId}/retry-notification`));
