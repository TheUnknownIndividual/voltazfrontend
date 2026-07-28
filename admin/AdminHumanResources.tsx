import React, { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, CheckCircle2, CircleUserRound, MessageCircle, Pencil, Search, ShieldCheck, Users, XCircle } from 'lucide-react';
import { getAccountingOverview, updateAccountingEmployee, type AccountingEmployee } from '../api/accounting';
import { useNotification } from '../contexts/NotificationContext';

const input = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';
const dateText = (value?: string | null) => value ? new Date(value).toLocaleDateString('az-AZ') : 'Təyin edilməyib';
type EmployeeDraft = { displayName: string; monthlySalary: string; employmentStartDate: string; salaryPaymentDate: string; clearMonthlySalary: boolean };
const draftFor = (employee: AccountingEmployee): EmployeeDraft => ({ displayName: employee.displayName, monthlySalary: employee.monthlySalary?.toString() || '', employmentStartDate: employee.employmentStartDate?.slice(0, 10) || '', salaryPaymentDate: employee.salaryPaymentDate?.slice(0, 10) || '', clearMonthlySalary: false });

const AdminHumanResources: React.FC = () => {
  const { showNotification } = useNotification();
  const [employees, setEmployees] = useState<AccountingEmployee[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('active');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<EmployeeDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { setEmployees((await getAccountingOverview())?.employees || []); }
    catch (error: any) { showNotification(error?.response?.data?.error?.details || 'İşçi siyahısı yüklənmədi.', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const visibleEmployees = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('az-AZ');
    return employees.filter((employee) => (status === 'all' || (status === 'active' ? employee.isActive : !employee.isActive)) && (!normalized || [employee.displayName, employee.username, employee.role].some((value) => value.toLocaleLowerCase('az-AZ').includes(normalized))));
  }, [employees, query, status]);
  const beginEdit = (employee: AccountingEmployee) => { setExpandedId(employee.id); setEditingId(employee.id); setDraft(draftFor(employee)); };
  const cancelEdit = () => { setEditingId(null); setDraft(null); };
  const save = async (employee: AccountingEmployee) => {
    if (!draft || !draft.displayName.trim()) { showNotification('Əməkdaşın adı tələb olunur.', 'warning'); return; }
    if (draft.monthlySalary && Number(draft.monthlySalary) < 0) { showNotification('Aylıq əməkhaqqı mənfi ola bilməz.', 'warning'); return; }
    setSaving(true);
    try {
      const overview = await updateAccountingEmployee(employee.id, { displayName: draft.displayName, monthlySalary: draft.monthlySalary ? Number(draft.monthlySalary) : null, employmentStartDate: draft.employmentStartDate || null, salaryPaymentDate: draft.salaryPaymentDate || null, clearMonthlySalary: draft.clearMonthlySalary });
      setEmployees(overview.employees || []); cancelEdit(); showNotification('İnsan resursları məlumatı yeniləndi.');
    } catch (error: any) { showNotification(error?.response?.data?.error?.details || 'Məlumat yadda saxlanmadı.', 'error'); }
    finally { setSaving(false); }
  };
  const activeCount = employees.filter((employee) => employee.isActive).length;
  const connectedCount = employees.filter((employee) => employee.hasTelegramConnection).length;
  const stakeholderCount = employees.filter((employee) => employee.isStakeholder).length;

  return <section className="space-y-6 animate-in fade-in duration-300">
    <header className="rounded-[2rem] bg-emerald-950 px-5 py-6 text-white shadow-xl md:px-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.24em] text-emerald-300">Daxili heyət</p><h1 className="mt-2 text-2xl font-black md:text-3xl">İnsan Resursları</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-100/75">Əməkdaşın adı, aylıq əməkhaqqı, işə başlama və ödəniş tarixləri burada idarə olunur. Dəyişikliklər mühasibatlıq və layihə icmalı ilə avtomatik sinxronlaşır.</p></div><div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-bold text-emerald-50"><Users size={16}/> {employees.length} hesab sinxronlaşdırılıb</div></div></header>
    <div className="grid gap-4 sm:grid-cols-3"><Metric icon={<BriefcaseBusiness size={17}/>} label="Aktiv əməkdaşlar" value={`${activeCount}`} /><Metric icon={<MessageCircle size={17}/>} label="Telegram bağlı" value={`${connectedCount}`} /><Metric icon={<ShieldCheck size={17}/>} label="Stakeholder" value={`${stakeholderCount}`} /></div>
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-6"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-base font-black text-slate-900">İşçi kataloqu</h2><p className="mt-1 text-xs text-slate-500">Daimi staff tarixləri və əməkhaqqı bu səhifənin mənbə məlumatıdır.</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative block min-w-[240px]"><Search size={15} className="pointer-events-none absolute left-3 top-3 text-slate-400"/><input aria-label="İşçi axtar" value={query} onChange={(event) => setQuery(event.target.value)} className={`${input} pl-9`} placeholder="Ad, istifadəçi adı və ya rol"/></label><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className={input}><option value="active">Aktivlər</option><option value="all">Hamısı</option><option value="inactive">Deaktivlər</option></select></div></div>
      {loading && <div className="py-16 text-center text-xs font-bold uppercase tracking-widest text-slate-400">Yüklənir…</div>}
      {!loading && visibleEmployees.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">Uyğun əməkdaş tapılmadı.</div>}
      {!loading && visibleEmployees.length > 0 && <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleEmployees.map((employee) => <EmployeeCard key={employee.id} employee={employee} expanded={expandedId === employee.id} editing={editingId === employee.id} draft={editingId === employee.id ? draft : null} saving={saving} onToggle={() => setExpandedId(expandedId === employee.id ? null : employee.id)} onEdit={() => beginEdit(employee)} onCancel={cancelEdit} onChange={setDraft} onSave={() => save(employee)} />)}</div>}
    </section>
  </section>;
};

const EmployeeCard = ({ employee, expanded, editing, draft, saving, onToggle, onEdit, onCancel, onChange, onSave }: { employee: AccountingEmployee; expanded: boolean; editing: boolean; draft: EmployeeDraft | null; saving: boolean; onToggle: () => void; onEdit: () => void; onCancel: () => void; onChange: React.Dispatch<React.SetStateAction<EmployeeDraft | null>>; onSave: () => void }) => <article className={`overflow-hidden rounded-2xl border bg-white transition ${expanded ? 'border-emerald-300 shadow-lg shadow-emerald-100/60' : 'border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md'}`}><button type="button" onClick={onToggle} className="w-full p-5 text-left"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><CircleUserRound size={21}/></div><div className="min-w-0"><h3 className="truncate font-black text-slate-900">{employee.displayName}</h3><p className="truncate text-xs text-slate-500">@{employee.username}</p></div></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${employee.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{employee.isActive ? 'Aktiv' : 'Deaktiv'}</span></div><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">{employee.role}</span>{employee.hasTelegramConnection ? <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700"><MessageCircle size={12}/> Telegram bağlı</span> : <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-400"><XCircle size={12}/> Telegram yoxdur</span>}</div></button>{expanded && <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-xs">{!editing ? <><div className="grid gap-3 sm:grid-cols-2"><Detail label="Aylıq əməkhaqqı" value={employee.monthlySalary ? `${employee.monthlySalary.toLocaleString('az-AZ')} AZN` : 'Təyin edilməyib'}/><Detail label="İşə başlama" value={dateText(employee.employmentStartDate)}/><Detail label="Ödəniş tarixi" value={dateText(employee.salaryPaymentDate)}/><Detail label="Telegram" value={employee.hasTelegramConnection ? 'Bağlıdır' : 'Bağlanmayıb'}/></div><button type="button" onClick={onEdit} className="mt-4 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white"><Pencil size={13}/> Düzəlt</button></> : draft && <div className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><Label title="Görünən ad"><input value={draft.displayName} onChange={(event) => onChange((current) => current ? { ...current, displayName: event.target.value } : current)} className={input}/></Label><Label title="Aylıq əməkhaqqı (AZN)"><input type="number" min="0" step="0.01" value={draft.monthlySalary} disabled={draft.clearMonthlySalary} onChange={(event) => onChange((current) => current ? { ...current, monthlySalary: event.target.value } : current)} className={input}/></Label><Label title="İşə başlama tarixi"><input type="date" value={draft.employmentStartDate} onChange={(event) => onChange((current) => current ? { ...current, employmentStartDate: event.target.value } : current)} className={input}/></Label><Label title="Ödəniş tarixi"><input type="date" value={draft.salaryPaymentDate} onChange={(event) => onChange((current) => current ? { ...current, salaryPaymentDate: event.target.value } : current)} className={input}/></Label></div><label className="flex items-center gap-2 text-xs font-bold text-rose-700"><input type="checkbox" checked={draft.clearMonthlySalary} onChange={(event) => onChange((current) => current ? { ...current, clearMonthlySalary: event.target.checked } : current)}/> Əməkhaqqını sil</label><div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 font-bold text-slate-500">Ləğv et</button><button type="button" disabled={saving} onClick={onSave} className="rounded-lg bg-emerald-600 px-3 py-2 font-black text-white">{saving ? 'Yadda saxlanır…' : 'Yadda saxla'}</button></div></div>}</div>}</article>;

const Label = ({ title, children }: { title: string; children: React.ReactNode }) => <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}<div className="mt-1">{children}</div></label>;
const Detail = ({ label, value }: { label: string; value: string }) => <div><div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</div><div className="mt-1 font-bold text-slate-700">{value}</div></div>;
const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-xs font-black text-emerald-700">{icon}{label}</div><div className="mt-3 text-2xl font-black text-slate-900">{value}</div></div>;

export default AdminHumanResources;
