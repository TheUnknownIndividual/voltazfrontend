import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  lang?: "az" | "en";
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  lang = "az",
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

    const success = await login({
      username: formData.identifier,
      password: formData.password,
    });

    if (success) {
      onClose();
    } else {
      setError(
        lang === "az"
          ? "İstifadəçi adı və ya şifrə yanlışdır"
          : "Invalid username or password"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
        <h2 className="text-2xl font-black mb-6">
          {lang === "az" ? "Giriş" : "Login"}
        </h2>

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
            placeholder="Şifrə"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full border p-3 rounded"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button className="w-full bg-emerald-600 text-white py-3 rounded" disabled={loading}>
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