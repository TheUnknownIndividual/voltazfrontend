import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import SocialAuthButtons from "./SocialAuthButtons";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  lang?: "az" | "en";
  onCustomerLogin?: (user: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  lang = "az",
  onCustomerLogin,
}) => {
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");

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
      setError(
        lang === "az"
          ? "İstifadəçi adı və ya şifrə yanlışdır"
          : "Invalid username or password"
      );
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6" onKeyDown={handleModalKeyDown}>
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
        <h2 className="text-2xl font-black mb-6">
          {lang === "az" ? "Giriş" : "Login"}
        </h2>

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
            {lang === "az" ? "və ya" : "or"}
          </span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Email və ya username"
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
            placeholder="Şifrə"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full border p-3 rounded"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded" disabled={loading}>
            {lang === "az" ? "Daxil ol" : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          {lang === "az" ? "Hesabın yoxdur?" : "No account?"}{" "}
          <button onClick={onSwitchToRegister} className="text-emerald-600">
            {lang === "az" ? "Qeydiyyat" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
