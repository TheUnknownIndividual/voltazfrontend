import React, { useState } from 'react';
import { ExternalLink, Send } from 'lucide-react';
import { createMyTelegramConnectionLink, type TelegramConnectionLink } from '../api/adminTelegramConnections';
import { useNotification } from '../contexts/NotificationContext';

const AdminTelegramProfile: React.FC = () => {
  const { showNotification } = useNotification();
  const [link, setLink] = useState<TelegramConnectionLink | null>(null);
  const generate = async (openTelegram = false) => {
    try {
      const value = await createMyTelegramConnectionLink();
      setLink(value);
      if (openTelegram) window.open(value.url, '_blank', 'noopener,noreferrer');
    } catch (error: any) { showNotification(error?.response?.data?.error?.details || 'Telegram bağlantısı yaradıla bilmədi.', 'error'); }
  };
  return <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-4"><div className="rounded-2xl bg-sky-50 p-3 text-sky-600"><Send size={24}/></div><div><p className="text-[10px] font-black uppercase tracking-widest text-sky-600">Şəxsi profil</p><h2 className="text-2xl font-black text-slate-900">Telegram bildirişləri</h2><p className="mt-2 text-sm text-slate-500">Bu düymə botu açır. Telegram-da Start etdikdən sonra hesabınız avtomatik bağlanır və tapşırıq bildirişləri həmin söhbətə gəlir.</p></div></div><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => generate(true)} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white"><ExternalLink size={16}/> Telegram-da aç</button><button type="button" onClick={() => generate(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-600">Yeni bağlantı yarat</button></div>{link && <div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-700">Bağlantı {new Date(link.expiresAt).toLocaleTimeString('az-AZ')} tarixinədək aktivdir.</p><a href={link.url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm text-sky-700 underline">{link.url}</a></div>}</section>;
};
export default AdminTelegramProfile;
