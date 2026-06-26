import React, { createContext, useContext, useState, useEffect } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS, STORAGE_KEYS } from "../utils/constants";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  role: string | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { post, loading } = useApi();

  const [role, setRole] = useState<string | null>(
    sessionStorage.getItem(STORAGE_KEYS.USER_DATA)
  );

  const [token, setToken] = useState<string | null>(
    sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  );

  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  // 🔥 LOGIN
 const login = async (credentials: { username: string; password: string }) => {
  try {
    const response = await post(API_ENDPOINTS.AUTH.LOGIN, credentials);

    if (response?.success) {
      const token = response.data.accessToken;

      if (!token) {
        console.error("Token tapılmadı");
        return false;
      }

      // 🔥 TOKEN DECODE
      const decoded: any = jwtDecode(token);

      // 🔥 ROLE-u çıxart (fərqli backendlər üçün safe)
      const role =
        decoded.role ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      // storage
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, role); // 

      // state
      setToken(token);
      setRole(role); // 
      setIsAuthenticated(true);


      return true;
    } else {
      console.error("Login uğursuz:", response?.message);
      return false;
    }
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};

  // 🔥 LOGOUT
  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);

    setToken(null);
    setRole(null);
    setIsAuthenticated(false);

    window.location.href = "/";
  };

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        role,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};