import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { getAdminTrackedProjects, type TrackedProject } from '../api/adminProjectTracker';
import { useNotification } from '../contexts/NotificationContext';

type Verification = { documentLogId: number; publicUrl: string; documentNumber: string; documentCode: string; issuerDisplayName: string; issuedAt: string; expiresAt: string; revokedAt?: string | null; adminTrackedProjectId?: number | null; adminTrackedProjectName?: string | null; revocationReason?: string | null };
const unwrap = <T,>(response: any): T => response.data?.data ?? response.data;

const AdminVerification: React.FC = () => {
  const { showNotification, confirm } = useNotification();
  const [records, setRecords] = useState<Verification[]>([]);
  const [projects, setProjects] = useState<TrackedProject[]>([]);
  const [revoking, setRevoking] = useState<Verification | null>(null);
  const [reason, setReason] = useState('');
  const load = async () => {
    try {
      const [verificationRows, trackerRows] = await Promise.all([axiosInstance.get('document-verifications'), getAdminTrackedProjects()]);
      setRecords(unwrap<Verification[]>(verificationRows)); setProjects(trackerRows);
    } catch { showNotification('Doğrulama qeydləri yüklənmədi.', 'error'); }
  };
  useEffect(() => { load(); }, []);
  const reissue = async (record: Verification) => {
    if (!await confirm(`${record.documentNumber} üçün yeni link və QR yaratmaq istəyirsiniz? Köhnə link etibarsız olacaq.`)) return;
    try { await axiosInstance.post(`document-verifications/document/${record.documentLogId}/reissue`); await load(); showNotification('Yeni doğrulama linki yaradıldı.'); }
    catch { showNotification('Link yenilənmədi.', 'error'); }
  };
  const linkProject = async (record: Verification, projectId: string) => {
    if (!projectId) return;
    try { await axiosInstance.put(`document-verifications/document/${record.documentLogId}/project`, { adminTrackedProjectId: Number(projectId) }); await load(); showNotification('Tracker layihəsi əlaqələndirildi.'); }
    catch { showNotification('Layihə əlaqələndirilmədi.', 'error'); }
  };
  const revoke = async () => {
    if (!revoking || reason.trim().length < 3) { showNotification('Ləğv səbəbini daxil edin.', 'error'); return; }
    try { await axiosInstance.post(`document-verifications/document/${revoking.documentLogId}/revoke`, { reason: reason.trim() }); setRevoking(null); setReason(''); await load(); showNotification('Sənəd ləğv edildi. Tracker layihəsi aktiv qalır.', 'warning'); }
    catch { showNotification('Sənəd ləğv edilmədi.', 'error'); }
  };
  return <section className="space-y-6"><div><p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Volt.az sənəd təhlükəsizliyi</p><h2 className="mt-1 text-2xl font-black text-slate-900">Sənəd doğrulaması</h2><p className="mt-1 text-sm text-slate-500">Yeni sənədlər tracker layihəsi ilə verilir. Köhnə sənədləri burada əlaqələndirin; ləğv yalnız doğrulamanı dəyişir, əməliyyat layihəsini yox.</p></div><div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white"><table className="w-full text-left"><thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400"><tr><th className="px-6 py-4">Sənəd</th><th className="px-6 py-4">Tracker layihəsi</th><th className="px-6 py-4">Etibarlılıq</th><th className="px-6 py-4 text-right">Əməliyyat</th></tr></thead><tbody className="divide-y divide-slate-50">{records.map((record) => { const state = record.revokedAt ? 'Ləğv edilib' : new Date(record.expiresAt) < new Date() ? 'Müddəti bitib' : 'Etibarlı'; return <tr key={record.documentLogId}><td className="px-6 py-5"><div className="font-black text-slate-900">{record.documentNumber}</div><div className="text-xs text-slate-500">{record.issuerDisplayName}</div><a href={record.publicUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-600">Linki aç</a></td><td className="px-6 py-5"><select value={record.adminTrackedProjectId || ''} onChange={(event) => linkProject(record, event.target.value)} className="max-w-[220px] rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700"><option value="">Layihə seçin</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></td><td className="px-6 py-5 text-xs text-slate-500"><div>{state}</div><div>{new Date(record.expiresAt).toLocaleDateString('az-AZ')}</div></td><td className="px-6 py-5 text-right"><div className="flex justify-end gap-2"><button onClick={() => reissue(record)} className="rounded-lg bg-blue-50 px-3 py-2 text-[9px] font-black uppercase text-blue-700">Yenidən ver</button>{!record.revokedAt && <button onClick={() => { setReason(''); setRevoking(record); }} className="rounded-lg bg-red-50 px-3 py-2 text-[9px] font-black uppercase text-red-600">Ləğv et</button>}</div></td></tr>; })}{records.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">Hələ doğrulama qeydi yoxdur.</td></tr>}</tbody></table></div>{revoking && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4" onMouseDown={() => setRevoking(null)}><div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><h3 className="text-lg font-black text-slate-900">Sənədi ləğv et</h3><p className="mt-2 text-sm text-slate-500">{revoking.documentNumber} üçün daxili ləğv səbəbini yazın. Bu əməliyyat tracker layihəsini deaktiv etmir.</p><textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-4 min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Daxili ləğv səbəbi" maxLength={1000} /><div className="mt-4 flex justify-end gap-2"><button onClick={() => setRevoking(null)} className="rounded-xl px-4 py-2 text-xs font-black text-slate-500">Bağla</button><button onClick={revoke} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white">Ləğv et</button></div></div></div>}</section>;
};
export default AdminVerification;
