import axiosInstance from './axiosInstance';

export interface AccountingEmployee {
  id: number;
  username: string;
  displayName: string;
  isActive: boolean;
  monthlySalary: number | null;
  employmentStartDate: string | null;
  salaryPaymentDate: string | null;
  role: string;
  isSuperAdmin: boolean;
  isStakeholder: boolean;
  hasTelegramConnection: boolean;
}
export interface AccountingWorker { id: number; firstName: string; lastName: string; amountPaid: number; startDate: string; endDate: string; note: string; }
export interface AccountingStaff { id: number; displayName: string; roleName: string; employmentStartDate: string | null; salaryPaymentDate: string | null; monthlySalary: number | null; }
export interface AccountingBoqItem { id: number; itemName: string; unit: string; plannedQuantity: number; unitCost: number | null; note: string; }
export interface AccountingExpense { id: number; category: string; name: string; amount: number; expenseDate: string; receiptUrl: string; note: string; createdByName: string; }
export interface AccountingProject { id: number; name: string; status: string; isArchived: boolean; boqPlannedCost: number; warehouseCost: number; staffSalaryCost: number; externalWorkerCost: number; miscellaneousCost: number; totalCost: number; sourceOfferPrice: number | null; location: string; description: string; projectManagerName: string; plannedStartDate: string | null; plannedEndDate: string | null; staff: AccountingStaff[]; boqItems: AccountingBoqItem[]; externalWorkers: AccountingWorker[]; expenses: AccountingExpense[]; }
export interface AccountingOverview { employees: AccountingEmployee[]; projects: AccountingProject[]; }

const unwrap = <T,>(response: any): T => response.data?.data as T;

export const getAccountingOverview = async () => unwrap<AccountingOverview>(await axiosInstance.get('Accounting'));
export const updateAccountingEmployee = async (employeeId: number, payload: { displayName: string; monthlySalary?: number | null; employmentStartDate?: string | null; salaryPaymentDate?: string | null; clearMonthlySalary?: boolean }) => unwrap<AccountingOverview>(await axiosInstance.put(`Accounting/employees/${employeeId}`, payload));
export const addAccountingExpense = async (projectId: number, payload: { category: string; name: string; amount: number; expenseDate: string; receiptUrl?: string; note?: string }) => unwrap<AccountingOverview>(await axiosInstance.post(`Accounting/projects/${projectId}/expenses`, payload));
export const deleteAccountingExpense = async (projectId: number, expenseId: number) => unwrap<AccountingOverview>(await axiosInstance.delete(`Accounting/projects/${projectId}/expenses/${expenseId}`));
export const uploadAccountingReceipt = async (projectId: number, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return unwrap<string>(await axiosInstance.post(`Accounting/projects/${projectId}/receipt`, form, { headers: { 'Content-Type': 'multipart/form-data' } }));
};
