
import React, { useState } from 'react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'az' | 'en';
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, lang = 'az' }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phonePrefix: '050',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(lang === 'az' ? 'Şifrələr uyğun gəlmir' : 'Passwords do not match');
      return;
    }

    const fullPhone = `${formData.phonePrefix}${formData.phone}`;
    const savedUsers = JSON.parse(localStorage.getItem('volt_users') || '[]');
    if (savedUsers.find((u: any) => u.email === formData.email || u.phone === fullPhone)) {
      setError(lang === 'az' ? 'Bu email və ya nömrə ilə artıq qeydiyyat var' : 'Email or phone already registered');
      return;
    }

    const newUser = { 
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      role: 'customer',
      address: formData.address,
      phone: fullPhone,
      isApproved: true,
      registrationDate: new Date().toISOString()
    };

    // Bazaya əlavə et
    localStorage.setItem('volt_users', JSON.stringify([...savedUsers, newUser]));
    
    // Login et
    onRegisterSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-2">{lang === 'az' ? 'Yeni Hesab Yarat' : 'Create Account'}</h2>
          <p className="text-slate-500 text-sm">Müştəri kabinetinə giriş üçün qeydiyyatdan keçin.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ad *</label>
              <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="Məs: Əli" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Soyad *</label>
              <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="Məs: Məmmədov" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Əlaqə nömrəsi *</label>
              <div className="flex gap-2">
                <select 
                  value={formData.phonePrefix} 
                  onChange={e => setFormData({...formData, phonePrefix: e.target.value})}
                  className="w-24 bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none font-bold text-slate-700"
                >
                  {['050', '051', '055', '099', '077', '070'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 7)})} className="flex-grow bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-slate-700" placeholder="1234567" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email *</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="email@example.com" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ünvan (Vacib deyil)</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="Bakı şəhəri, Səbail r." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şifrə *</label>
              <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Yeni Şifrə *</label>
              <input required type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="••••••••" />
            </div>
          </div>

          {error && <p className="text-red-500 text-[10px] font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}

          <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/10 active:scale-95 mt-4">
            Qeydiyyatı Tamamla
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
