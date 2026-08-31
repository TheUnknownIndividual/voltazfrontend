import React, { useEffect, useState } from 'react';
import { ExternalLink, Send } from 'lucide-react';
import { createMyTelegramConnectionLink, getMyTelegramConnectionStatus, type TelegramConnectionLink, type TelegramConnectionStatus } from '../api/adminTelegramConnections';
import { useNotification } from '../contexts/NotificationContext';

const AdminTelegramProfile: React.FC = () => {
  const { showNotification } = useNotification();
  const [link, setLink] = useState<TelegramConnectionLink | null>(null);
  const [status, setStatus] = useState<TelegramConnectionStatus | null>(null);
  const refreshStatus = async () => {
    try { setStatus(await getMyTelegramConnectionStatus()); }
    catch { setStatus(null); }
  };
  useEffect(() => { void refreshStatus(); }, []);
  useEffect(() => {
    if (!link || status?.linkState !== 'valid') return;
    const timer = window.setInterval(refreshStatus, 3000);
    return () => window.clearInterval(timer);
  }, [link?.url, status?.linkState]);
  const generate = async (openTelegram = false) => {
    try {
      const value = await createMyTelegramConnectionLink();
      setLink(value);
      setStatus({ adminUserId: value.adminUserId, isLinked: Boolean(status?.isLinked), telegramChatId: status?.telegramChatId, linkState: 'valid', linkExpiresAt: value.expiresAt });
      if (openTelegram) window.open(value.url, '_blank', 'noopener,noreferrer');
    } catch (error: any) { showNotification(error?.response?.data?.error?.details || 'Telegram bağlantısı yaradıla bilmədi.', 'error'); }
  };
  return <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-4"><div className="rounded-2xl bg-sky-50 p-3 text-sky-600"><Send size={24}/></div><div><p className="text-[10px] font-black uppercase tracking-widest text-sky-600">Şəxsi profil</p><h2 className="text-2xl font-black text-slate-900">Telegram bildirişləri</h2><p className="mt-2 text-sm text-slate-500">Yeni link həm ilk qoşulma, həm də mövcud Telegram hesabını yenidən bağlamaq üçün istifadə oluna bilər.</p></div></div><div className={`mt-5 rounded-xl border px-4 py-3 text-xs font-black ${status?.isLinked ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>{status?.isLinked ? `Telegram qoşulub${status.telegramChatId ? ` · Chat ID ${status.telegramChatId}` : ''}` : 'Telegram hesabı qoşulmayıb.'}{status?.linkState === 'valid' && status.linkExpiresAt ? ` Aktiv link ${new Date(status.linkExpiresAt).toLocaleTimeString('az-AZ')}-dək etibarlıdır.` : ''}{status?.linkState === 'expired' ? ' Son linkin vaxtı bitib.' : ''}</div><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => generate(true)} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white"><ExternalLink size={16}/> Yeni link yaradıb Telegram-da aç</button><button type="button" onClick={() => generate(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-600">Yalnız yeni link yarat</button></div>{link && <div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-700">Bağlantı {new Date(link.expiresAt).toLocaleTimeString('az-AZ')} tarixinədək aktivdir.</p><a href={link.url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm text-sky-700 underline">{link.url}</a></div>}</section>;
};
export default AdminTelegramProfile;
