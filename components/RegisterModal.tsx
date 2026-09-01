
import React, { useState } from 'react';
import SocialAuthButtons from './SocialAuthButtons';
import { useAuth } from '../contexts/AuthContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'az' | 'en' | 'ru' | 'tr';
  onRegisterSuccess?: (user: any) => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, lang = 'az', onRegisterSuccess }) => {
  const { register, loading } = useAuth();
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
  const copy = lang === 'az'
    ? { title: 'Yeni Hesab Yarat', intro: 'Müştəri kabinetinə giriş üçün qeydiyyatdan keçin.', or: 'və ya', submitting: 'Göndərilir...', submit: 'Qeydiyyatı tamamla', firstName: 'Ad', lastName: 'Soyad', phone: 'Əlaqə nömrəsi', address: 'Ünvan (vacib deyil)', password: 'Şifrə', confirmPassword: 'Şifrəni təsdiqləyin', passwordMismatch: 'Şifrələr uyğun gəlmir', passwordShort: 'Şifrə ən azı 6 simvol olmalıdır. Hərf, rəqəm və simvollardan istifadə edə bilərsiniz.', failed: 'Qeydiyyat alınmadı. Email və ya nömrə artıq istifadə oluna bilər.', firstPlaceholder: 'Məs: Əli', lastPlaceholder: 'Məs: Məmmədov', addressPlaceholder: 'Bakı şəhəri, Səbail r.' }
    : lang === 'ru'
      ? { title: 'Создать аккаунт', intro: 'Зарегистрируйтесь для входа в кабинет клиента.', or: 'или', submitting: 'Отправляется...', submit: 'Завершить регистрацию', firstName: 'Имя', lastName: 'Фамилия', phone: 'Номер телефона', address: 'Адрес (необязательно)', password: 'Пароль', confirmPassword: 'Подтвердите пароль', passwordMismatch: 'Пароли не совпадают', passwordShort: 'Пароль должен содержать не менее 6 символов. Можно использовать буквы, цифры и символы.', failed: 'Регистрация не выполнена. Возможно, email или номер уже используются.', firstPlaceholder: 'Например: Али', lastPlaceholder: 'Например: Мамедов', addressPlaceholder: 'г. Баку, Сабаильский р-н' }
      : lang === 'tr'
        ? { title: 'Yeni hesap oluştur', intro: 'Müşteri hesabına giriş için kayıt olun.', or: 'veya', submitting: 'Gönderiliyor...', submit: 'Kaydı tamamla', firstName: 'Ad', lastName: 'Soyad', phone: 'Telefon numarası', address: 'Adres (isteğe bağlı)', password: 'Şifre', confirmPassword: 'Şifreyi onaylayın', passwordMismatch: 'Şifreler eşleşmiyor', passwordShort: 'Şifre en az 6 karakter olmalıdır. Harf, rakam ve sembol kullanabilirsiniz.', failed: 'Kayıt başarısız oldu. E-posta veya telefon numarası zaten kullanılıyor olabilir.', firstPlaceholder: 'Örn.: Ali', lastPlaceholder: 'Örn.: Memmedov', addressPlaceholder: 'Bakü, Səbail ilçesi' }
        : { title: 'Create account', intro: 'Register to access your customer account.', or: 'or', submitting: 'Submitting...', submit: 'Complete registration', firstName: 'First name', lastName: 'Last name', phone: 'Phone number', address: 'Address (optional)', password: 'Password', confirmPassword: 'Confirm password', passwordMismatch: 'Passwords do not match', passwordShort: 'Password must be at least 6 characters. Letters, numbers, and symbols are allowed.', failed: 'Registration failed. Email or phone may already be registered.', firstPlaceholder: 'E.g. Ali', lastPlaceholder: 'E.g. Mammadov', addressPlaceholder: 'Baku, Sabail district' };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }

    if (formData.password.length < 6) {
      setError(copy.passwordShort);
      return;
    }

    const fullPhone = `${formData.phonePrefix}${formData.phone}`;
    const nextUser = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: fullPhone,
      address: formData.address,
      password: formData.password,
    });

    if (!nextUser) {
      setError(copy.failed);
      return;
    }

    onRegisterSuccess?.(nextUser);
    onClose();
  };

  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-social-auth="true"]')) return;
    e.preventDefault();
    e.currentTarget.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto p-3 py-6 sm:items-center sm:p-4" onKeyDown={handleModalKeyDown}>
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative my-auto max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl animate-in zoom-in-95 duration-300 sm:rounded-[2.5rem] sm:p-8 md:p-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-2">{copy.title}</h2>
          <p className="text-slate-500 text-sm">{copy.intro}</p>
        </div>

        <div className="mb-8">
          <SocialAuthButtons
            mode="register"
            lang={lang}
            getProfile={() => ({
              name: `${formData.firstName} ${formData.lastName}`.trim(),
              email: formData.email.trim(),
              phone: `${formData.phonePrefix}${formData.phone}`,
              address: formData.address,
            })}
            onSuccess={(nextUser) => {
              onRegisterSuccess?.(nextUser);
              onClose();
            }}
          />
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {copy.or}
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{copy.firstName} *</label>
              <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder={copy.firstPlaceholder} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{copy.lastName} *</label>
              <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder={copy.lastPlaceholder} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{copy.phone} *</label>
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{copy.address}</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder={copy.addressPlaceholder} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{copy.password} *</label>
              <input required type="password" minLength={6} autoComplete="new-password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{copy.confirmPassword} *</label>
              <input required type="password" minLength={6} autoComplete="new-password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="••••••••" />
            </div>
          </div>

          {error && <p className="text-red-500 text-[10px] font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading} className="flex w-full min-h-[var(--cta-btn-h)] items-center justify-center bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/10 active:scale-95 mt-4 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? copy.submitting : copy.submit}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
