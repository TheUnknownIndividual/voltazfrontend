import axiosInstance from './axiosInstance';

export type TelegramConnectionLink = { url: string; expiresAt: string };
const unwrap = <T,>(response: any) => response.data?.data as T;
export const createMyTelegramConnectionLink = async () => unwrap<TelegramConnectionLink>(await axiosInstance.post('AdminTelegramConnections/me'));
export const createAdminTelegramConnectionLink = async (adminUserId: number) => unwrap<TelegramConnectionLink>(await axiosInstance.post(`AdminTelegramConnections/${adminUserId}`));
