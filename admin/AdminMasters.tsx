
import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import MasterForum from '../components/MasterForum';

interface UserRecord {
  email: string;
  name: string;
  role: 'customer' | 'master' | 'admin';
  isApproved: boolean;
  registrationDate: string;
  city?: string;
  masterType?: string;
  documentImage?: string;
}

interface AdminMastersProps {
  users: UserRecord[];
  onUpdateUsers: (updated: UserRecord[]) => void;
  onSelectMaster: (master: UserRecord) => void;
}

const AdminMasters: React.FC<AdminMastersProps> = ({ users, onUpdateUsers, onSelectMaster }) => {
  const { showNotification, confirm } = useNotification();
  const [view, setView] = useState<'list' | 'forum'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const cities = ['all', 'Bakı', 'Gəncə', 'Sumqayıt', 'Quba', 'Qusar', 'Lənkəran', 'Şəki', 'Bərdə', 'Mingəçevir', 'Naxçıvan'];
  const masterTypes = ['all', 'Mühəndis', 'Texnik', 'Elektrik', 'Quraşdırıcı', 'Layihəçi'];

  const handleApprove = async (email: string) => {
    const safeUsers = Array.isArray(users) ? users : [];
    const user = safeUsers.find(u => u.email === email);
    if (!user) return;

    if (await confirm(`${user.name} adlı ustanı təsdiqləmək istədiyinizə əminsiniz?`)) {
      const updated = safeUsers.map(u => u.email === email ? { ...u, isApproved: true } : u);
      onUpdateUsers(updated);
      localStorage.setItem('volt_users', JSON.stringify(updated));
      showNotification('Usta uğurla təsdiqləndi!');
    }
  };

  const handleReject = async (email: string) => {
    const safeUsers = Array.isArray(users) ? users : [];
    const user = safeUsers.find(u => u.email === email);
    if (!user) return;

    if (await confirm(`${user.name} adlı ustanı rədd etmək və sistemdən silmək istədiyinizə əminsiniz? (Bu əməliyyat geri qaytarıla bilməz)`)) {
      const updated = safeUsers.filter(u => u.email !== email);
      onUpdateUsers(updated);
      localStorage.setItem('volt_users', JSON.stringify(updated));
      showNotification('Usta müraciəti rədd edildi və silindi.', 'warning');
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];

  const filteredMasters = safeUsers.filter(u => {
    if (u.role !== 'master') return false;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === 'all' || u.city === cityFilter;
    const matchesType = typeFilter === 'all' || u.masterType === typeFilter;
    return matchesSearch && matchesCity && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Ustalar Klubu</h3>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Usta qeydiyyatı və forum idarəetməsi</p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <button 
            onClick={() => setView('list')}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Usta Siyahısı
          </button>
          <button 
            onClick={() => setView('forum')}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'forum' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Forum
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ümumi Usta</div>
              <div className="text-3xl font-black text-slate-900">{safeUsers.filter(u => u.role === 'master').length}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Təsdiq Gözləyən</div>
              <div className="text-3xl font-black text-amber-500">{safeUsers.filter(u => u.role === 'master' && !u.isApproved).length}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aktiv Ustalar</div>
              <div className="text-3xl font-black text-emerald-600">{safeUsers.filter(u => u.role === 'master' && u.isApproved).length}</div>
            </div>
          </div>

          {/* Filters & Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-grow lg:flex-grow-0">
                  <input 
                    type="text" 
                    placeholder="Ad və ya email ilə axtar..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs outline-none focus:border-emerald-500 transition-all w-full lg:w-64" 
                  />
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <select 
                  value={cityFilter} 
                  onChange={e => setCityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:border-emerald-500 transition-all"
                >
                  {cities.map(c => <option key={c} value={c}>{c === 'all' ? 'Bütün Şəhərlər' : c}</option>)}
                </select>
                <select 
                  value={typeFilter} 
                  onChange={e => setTypeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:border-emerald-500 transition-all"
                >
                  {masterTypes.map(t => <option key={t} value={t}>{t === 'all' ? 'Bütün Tiplər' : t}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-5">Usta Məlumatları</th>
                    <th className="px-8 py-5">İxtisas / Şəhər</th>
                    <th className="px-8 py-5">Qeydiyyat Tarixi</th>
                    <th className="px-8 py-5 text-center">Status</th>
                    <th className="px-8 py-5 text-right">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredMasters.map((user) => (
                    <tr key={user.email} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black text-sm uppercase">
                            {user.name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{user.masterType}</span>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-[10px] font-bold text-yellow-700">5.0</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{user.city}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs text-slate-500">{user.registrationDate}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {user.isApproved ? 'Təsdiqlənib' : 'Gözləyir'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          {!user.isApproved && (
                            <button 
                              onClick={() => handleApprove(user.email)}
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                              title="Təsdiqlə"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </button>
                          )}
                          <button 
                            onClick={() => onSelectMaster(user)}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                            title="Detallı Bax"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button 
                            onClick={() => handleReject(user.email)}
                            className="p-2 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                            title="Sil / İmtina et"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMasters.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-400 text-xs italic">Usta tapılmadı.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <MasterForum masters={safeUsers.filter(u => u.role === 'master')} />
        </div>
      )}
    </div>
  );
};

export default AdminMasters;
