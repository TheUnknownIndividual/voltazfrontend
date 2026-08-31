import axiosInstance from './axiosInstance';

export type TelegramConnectionLink = { url: string; expiresAt: string; adminUserId: number; linkState: 'valid' };
export type TelegramConnectionStatus = {
  adminUserId: number;
  isLinked: boolean;
  telegramChatId?: number | null;
  linkState: 'none' | 'valid' | 'redeemed' | 'expired' | 'linked';
  linkExpiresAt?: string | null;
};
const unwrap = <T,>(response: any) => response.data?.data as T;
export const createMyTelegramConnectionLink = async () => unwrap<TelegramConnectionLink>(await axiosInstance.post('AdminTelegramConnections/me'));
export const createAdminTelegramConnectionLink = async (adminUserId: number) => unwrap<TelegramConnectionLink>(await axiosInstance.post(`AdminTelegramConnections/${adminUserId}`));
export const getMyTelegramConnectionStatus = async () => unwrap<TelegramConnectionStatus>(await axiosInstance.get('AdminTelegramConnections/me/status'));
export const getAdminTelegramConnectionStatus = async (adminUserId: number) => unwrap<TelegramConnectionStatus>(await axiosInstance.get(`AdminTelegramConnections/${adminUserId}/status`));
