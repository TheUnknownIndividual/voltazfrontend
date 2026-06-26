
import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface UserRecord {
  email: string;
  name: string;
  role: string;
  isApproved: boolean;
  registrationDate: string;
  city?: string;
  masterType?: string;
}

interface AdminPermissionsProps {
  users: UserRecord[];
  onUpdateUsers: (updatedUsers: UserRecord[]) => void;
}

const AdminPermissions: React.FC<AdminPermissionsProps> = ({ users, onUpdateUsers }) => {
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const roles = ['Supervayzer', 'Koordinator', 'Menecer', 'admin', 'customer'];

  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers.filter(u => 
    u.role !== 'master' && 
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRoleChange = (email: string, newRole: string) => {
    const userToUpdate = safeUsers.find(u => u.email === email);
    if (userToUpdate?.role === 'master') {
      showNotification('Usta profilinin rolu dəyişdirilə bilməz.', 'error');
      return;
    }
    const updatedUsers = safeUsers.map(u => u.email === email ? { ...u, role: newRole } : u);
    onUpdateUsers(updatedUsers);
    localStorage.setItem('volt_users', JSON.stringify(updatedUsers));
    setSelectedUser(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-2xl font-black text-slate-900">Səlahiyyətlər</h3>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="İstifadəçi axtar..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs outline-none focus:border-emerald-500 transition-all shadow-sm"
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-4">İstifadəçi</th>
                <th className="px-8 py-4">Mövcud Rol</th>
                <th className="px-8 py-4">Şəhər</th>
                <th className="px-8 py-4 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr 
                  key={user.email} 
                  onClick={() => setSelectedUser(user)}
                  className="group hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <div className="text-sm font-black text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      user.role === 'admin' ? 'bg-red-50 text-red-600' : 
                      ['Supervayzer', 'Koordinator', 'Menecer'].includes(user.role) ? 'bg-purple-50 text-purple-600' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs text-slate-500">
                    {user.city || '-'}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Rolu Dəyiş
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Selection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Rol Təyini</h3>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="mb-6">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seçilmiş İstifadəçi</div>
                <div className="text-sm font-bold text-slate-900">{selectedUser.name} ({selectedUser.email})</div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {roles.map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(selectedUser.email, role)}
                    className={`w-full text-left px-6 py-4 rounded-2xl text-xs font-bold transition-all ${
                      selectedUser.role === role 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPermissions;
