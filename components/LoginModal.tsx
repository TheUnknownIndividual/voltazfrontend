import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import SocialAuthButtons from "./SocialAuthButtons";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
  lang?: "az" | "en" | "ru" | "tr";
  onCustomerLogin?: (user: any) => void;
  showRegisterLink?: boolean;
  message?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  lang = "az",
  onCustomerLogin,
  showRegisterLink = true,
  message,
}) => {
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");
  const copy = lang === 'az'
    ? { title: 'Giriş', or: 'və ya', identifier: 'Email və ya istifadəçi adı', password: 'Şifrə', submit: 'Daxil ol', noAccount: 'Hesabınız yoxdur?', register: 'Qeydiyyat', invalid: 'İstifadəçi adı və ya şifrə yanlışdır' }
    : lang === 'ru'
      ? { title: 'Вход', or: 'или', identifier: 'Email или имя пользователя', password: 'Пароль', submit: 'Войти', noAccount: 'Нет аккаунта?', register: 'Регистрация', invalid: 'Неверное имя пользователя или пароль' }
      : lang === 'tr'
        ? { title: 'Giriş', or: 'veya', identifier: 'E-posta veya kullanıcı adı', password: 'Şifre', submit: 'Giriş yap', noAccount: 'Hesabınız yok mu?', register: 'Kayıt ol', invalid: 'Kullanıcı adı veya şifre hatalı' }
        : { title: 'Login', or: 'or', identifier: 'Email or username', password: 'Password', submit: 'Login', noAccount: 'No account?', register: 'Register', invalid: 'Invalid username or password' };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nextUser = await login({
      username: formData.identifier,
      password: formData.password,
    });

    if (nextUser) {
      onCustomerLogin?.(nextUser);
      onClose();
    } else {
      setError(copy.invalid);
    }
  };

  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" || e.shiftKey || loading) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-social-auth="true"]')) return;
    e.preventDefault();
    e.currentTarget.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto p-3 py-6 sm:items-center sm:p-6" onKeyDown={handleModalKeyDown}>
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative my-auto max-h-[calc(100vh-3rem)] w-full max-w-md overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:rounded-[2.5rem] sm:p-10">
        <h2 className="text-2xl font-black mb-6">
          {copy.title}
        </h2>

        {message && (
          <p className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
            {message}
          </p>
        )}

        <div className="mb-6">
          <SocialAuthButtons
            mode="login"
            lang={lang}
            getProfile={() => ({
              email: formData.identifier.includes("@") ? formData.identifier.trim() : undefined,
            })}
            onSuccess={(nextUser) => {
              onCustomerLogin?.(nextUser);
              onClose();
            }}
          />
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {copy.or}
          </span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={copy.identifier}
            value={formData.identifier}
            onChange={(e) =>
              setFormData({ ...formData, identifier: e.target.value })
            }
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="password"
            autoComplete="current-password"
            placeholder={copy.password}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full border p-3 rounded"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="flex w-full min-h-[var(--cta-btn-h)] items-center justify-center bg-emerald-600 text-white py-3 rounded" disabled={loading}>
            {copy.submit}
          </button>
        </form>

        {showRegisterLink && onSwitchToRegister && (
          <p className="mt-4 text-sm text-center">
            {copy.noAccount}{" "}
            <button onClick={onSwitchToRegister} className="text-emerald-600">
              {copy.register}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
