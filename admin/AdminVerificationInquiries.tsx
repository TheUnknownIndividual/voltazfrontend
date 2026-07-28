import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { getAdminSession, getAdminUsers, type AdminUser } from '../api/adminUsers';
import { useNotification } from '../contexts/NotificationContext';

type Inquiry = { id: number; type: string; status: string; comment: string; createdAt: string; assignedAdminUserId?: number | null; assignedAdminDisplayName?: string | null; documentLogId: number; documentNumber: string; documentCode: string; verificationStatus: string; adminTrackedProjectId?: number | null; adminTrackedProjectName?: string | null };
type Detail = Inquiry & { issuerDisplayName: string; issuedAt: string; expiresAt: string; revokedAt?: string | null; revocationReason?: string | null; documentPayloadJson: string; project?: any };
const unwrap = <T,>(response: any): T => response.data?.data ?? response.data;
const typeLabels: Record<string, string> = { question: 'Sual', renewal: 'Yenilənmə', 'revocation-review': 'Ləğv baxışı' };
const statusLabels: Record<string, string> = { new: 'Yeni', 'in-progress': 'İcradadır', resolved: 'Həll edildi' };

const AdminVerificationInquiries: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { showNotification } = useNotification();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [fullAdmin, setFullAdmin] = useState(false);
  const [type, setType] = useState(''); const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<Detail | null>(null);
  const load = async () => {
    try {
      const session = await getAdminSession(); setFullAdmin(session.isSuperAdmin);
      const query = new URLSearchParams(); if (type) query.set('type', type); if (status) query.set('status', status);
      const page = unwrap<{ items: Inquiry[] }>(await axiosInstance.get(`document-verification-inquiries?${query.toString()}`));
      setItems(page.items || []);
      if (session.isSuperAdmin) setAdmins((await getAdminUsers()).filter((admin) => admin.isActive));
    } catch { showNotification('Sənəd müraciətləri yüklənmədi.', 'error'); }
  };
  useEffect(() => { load(); }, [type, status]);
  const open = async (id: number) => {
    try { setSelected(unwrap<Detail>(await axiosInstance.get(`document-verification-inquiries/${id}`))); }
    catch { showNotification('Müraciət detalları yüklənmədi.', 'error'); }
  };
  const setAssignment = async (id: number, assignedAdminUserId: string) => {
    try { await axiosInstance.put(`document-verification-inquiries/${id}/assignment`, { assignedAdminUserId: assignedAdminUserId ? Number(assignedAdminUserId) : null }); await load(); if (selected?.id === id) await open(id); }
    catch { showNotification('Təyinat yenilənmədi.', 'error'); }
  };
  const setInquiryStatus = async (id: number, next: string) => {
    try { await axiosInstance.put(`document-verification-inquiries/${id}/status`, { status: next }); await load(); if (selected?.id === id) await open(id); }
    catch { showNotification('Müraciət statusu yenilənmədi.', 'error'); }
  };
  return <section className={`space-y-4 ${embedded ? '' : 'border-t border-slate-200 pt-8'}`}><div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">{!embedded && <div><p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Sənəd müraciətləri</p><h4 className="mt-1 text-xl font-black text-slate-900">Doğrulama müraciətləri</h4><p className="mt-1 text-sm text-slate-500">Yalnız sənəd üzrə açılan müraciətlər burada görünür.</p></div>}<div className={`flex flex-wrap gap-2 ${embedded ? 'md:ml-auto' : ''}`}><select value={type} onChange={(event) => setType(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"><option value="">Bütün növlər</option>{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"><option value="">Bütün statuslar</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div><div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white"><table className="w-full text-left"><thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400"><tr><th className="px-5 py-3">Sənəd / növ</th><th className="px-5 py-3">Mesaj</th><th className="px-5 py-3">Təyinat</th><th className="px-5 py-3">Status</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y divide-slate-50">{items.map((item) => <tr key={item.id}><td className="px-5 py-4"><div className="font-black text-slate-900">{item.documentNumber}</div><div className="text-xs text-slate-500">{typeLabels[item.type] || item.type} · {item.adminTrackedProjectName || 'Layihə əlaqələndirilməyib'}</div></td><td className="max-w-60 truncate px-5 py-4 text-xs text-slate-600">{item.comment || 'Qeyd yoxdur'}</td><td className="px-5 py-4">{fullAdmin ? <select value={item.assignedAdminUserId || ''} onChange={(event) => setAssignment(item.id, event.target.value)} className="max-w-40 rounded-lg border border-slate-200 px-2 py-2 text-xs font-bold"><option value="">Təyin edilməyib</option>{admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.displayName}</option>)}</select> : <span className="text-xs font-bold text-slate-600">{item.assignedAdminDisplayName || '—'}</span>}</td><td className="px-5 py-4"><select value={item.status} onChange={(event) => setInquiryStatus(item.id, event.target.value)} className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-bold">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td><td className="px-5 py-4 text-right"><button onClick={() => open(item.id)} className="rounded-lg bg-emerald-50 px-3 py-2 text-[9px] font-black uppercase text-emerald-700">Bax</button></td></tr>)}{items.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">Sənəd müraciəti yoxdur.</td></tr>}</tbody></table></div>{selected && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-4" onMouseDown={() => setSelected(null)}><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Sənəd müraciəti</p><h4 className="text-xl font-black text-slate-900">{selected.documentNumber}</h4></div><button onClick={() => setSelected(null)} className="text-2xl text-slate-400">×</button></div><div className="mt-5 grid gap-3 text-sm md:grid-cols-2"><div><b>Növ:</b> {typeLabels[selected.type] || selected.type}</div><div><b>Doğrulama:</b> {selected.verificationStatus}</div><div><b>Göndərən:</b> {selected.issuerDisplayName}</div><div><b>Layihə:</b> {selected.adminTrackedProjectName || 'Əlaqələndirilməyib'}</div></div><div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{selected.comment || 'Əlavə qeyd edilməyib.'}</div>{selected.revocationReason && <div className="mt-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700"><b>Ləğv səbəbi:</b> {selected.revocationReason}</div>}<details className="mt-5 rounded-2xl border border-slate-100 p-4"><summary className="cursor-pointer text-sm font-black text-slate-800">Əlaqəli tracker layihəsi və sənəd məlumatı</summary><pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-slate-600">{JSON.stringify({ project: selected.project, documentPayload: selected.documentPayloadJson }, null, 2)}</pre></details></div></div>}</section>;
};
export default AdminVerificationInquiries;
