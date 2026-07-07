import React, { createContext, useContext, useState, useEffect } from "react";
import useApi from "../hooks/useApi";
import { API_ENDPOINTS, STORAGE_KEYS } from "../utils/constants";
import { jwtDecode } from "jwt-decode";

export type AppUser = {
  id?: number;
  email: string;
  name: string;
  role: "customer" | "master" | "admin";
  phone?: string;
  address?: string;
  isApproved?: boolean;
};

type SocialProfile = {
  name?: string;
  firstName?: string;
  lastName?: string;
};

type PasskeyProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
};

type PasskeyOptions = {
  challengeId: string;
  publicKeyOptionsJson: string;
};

interface AuthContextType {
  role: string | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<AppUser | null>;
  register: (request: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    password: string;
  }) => Promise<AppUser | null>;
  loginWithGoogle: (idToken: string, profile?: SocialProfile) => Promise<AppUser | null>;
  loginWithApple: (idToken: string, profile?: SocialProfile) => Promise<AppUser | null>;
  beginPasskeyRegistration: (profile: PasskeyProfile) => Promise<PasskeyOptions | null>;
  completePasskeyRegistration: (challengeId: string, credential: unknown) => Promise<AppUser | null>;
  beginPasskeyLogin: (email?: string) => Promise<PasskeyOptions | null>;
  completePasskeyLogin: (challengeId: string, credential: unknown) => Promise<AppUser | null>;
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

  const normalizeCustomer = (customer: any): AppUser => ({
    id: customer?.id,
    email: customer?.email || "",
    name: customer?.name || `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim(),
    role: "customer",
    phone: customer?.phone || "",
    address: customer?.address || "",
    isApproved: true,
  });

  const persistAuth = (accessToken: string, nextRole: string, user?: AppUser) => {
    sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    sessionStorage.setItem(STORAGE_KEYS.USER_DATA, nextRole);
    sessionStorage.setItem(STORAGE_KEYS.USER_ROLE, nextRole);
    if (user) localStorage.setItem("volt_current_user", JSON.stringify(user));

    setToken(accessToken);
    setRole(nextRole);
    setIsAuthenticated(true);
  };

  const persistCustomerResponse = (response: any) => {
    if (!response?.success || !response.data?.accessToken) return null;

    const user = normalizeCustomer(response.data.user);
    persistAuth(response.data.accessToken, "Customer", user);
    return user;
  };

 const register = async (request: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    password: string;
  }) => {
  try {
    const response = await post(API_ENDPOINTS.AUTH.CUSTOMER_REGISTER, request);
    return persistCustomerResponse(response);
  } catch (error) {
    console.error("Register error:", error);
    return null;
  }
};

 const login = async (credentials: { username: string; password: string }) => {
  try {
    const customerResponse = await post(API_ENDPOINTS.AUTH.CUSTOMER_LOGIN, {
      identifier: credentials.username,
      password: credentials.password,
    });

    if (customerResponse?.success && customerResponse.data?.accessToken) {
      return persistCustomerResponse(customerResponse);
    }
  } catch (error) {
    // Fall through to admin login for existing back-office accounts.
  }

  try {
    const response = await post(API_ENDPOINTS.AUTH.LOGIN, credentials);

    if (response?.success) {
      const token = response.data.accessToken;

      if (!token) {
        console.error("Token tapılmadı");
        return null;
      }

      // 🔥 TOKEN DECODE
      const decoded: any = jwtDecode(token);

      // 🔥 ROLE-u çıxart (fərqli backendlər üçün safe)
      const role =
        decoded.role ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      const adminUser: AppUser = {
        email: "",
        name: decoded.unique_name || decoded.name || credentials.username,
        role: "admin",
      };

      persistAuth(token, role, adminUser);
      return adminUser;
    } else {
      console.error("Login uğursuz:", response?.message);
      return null;
    }
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};

  const loginWithGoogle = async (idToken: string, profile: SocialProfile = {}) => {
    try {
      const response = await post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
        idToken,
        ...profile,
      });
      return persistCustomerResponse(response);
    } catch (error) {
      console.error("Google login error:", error);
      return null;
    }
  };

  const loginWithApple = async (idToken: string, profile: SocialProfile = {}) => {
    try {
      const response = await post(API_ENDPOINTS.AUTH.APPLE_LOGIN, {
        idToken,
        ...profile,
      });
      return persistCustomerResponse(response);
    } catch (error) {
      console.error("Apple login error:", error);
      return null;
    }
  };

  const beginPasskeyRegistration = async (profile: PasskeyProfile) => {
    try {
      const response = await post(API_ENDPOINTS.AUTH.PASSKEY_REGISTER_OPTIONS, profile);
      if (!response?.success || !response.data?.challengeId || !response.data?.publicKeyOptionsJson) return null;
      return response.data as PasskeyOptions;
    } catch (error) {
      console.error("Passkey registration options error:", error);
      return null;
    }
  };

  const completePasskeyRegistration = async (challengeId: string, credential: unknown) => {
    try {
      const response = await post(API_ENDPOINTS.AUTH.PASSKEY_REGISTER_COMPLETE, {
        challengeId,
        credential,
      });
      return persistCustomerResponse(response);
    } catch (error) {
      console.error("Passkey registration error:", error);
      return null;
    }
  };

  const beginPasskeyLogin = async (email?: string) => {
    try {
      const response = await post(API_ENDPOINTS.AUTH.PASSKEY_LOGIN_OPTIONS, {
        email: email || undefined,
      });
      if (!response?.success || !response.data?.challengeId || !response.data?.publicKeyOptionsJson) return null;
      return response.data as PasskeyOptions;
    } catch (error) {
      console.error("Passkey login options error:", error);
      return null;
    }
  };

  const completePasskeyLogin = async (challengeId: string, credential: unknown) => {
    try {
      const response = await post(API_ENDPOINTS.AUTH.PASSKEY_LOGIN_COMPLETE, {
        challengeId,
        credential,
      });
      return persistCustomerResponse(response);
    } catch (error) {
      console.error("Passkey login error:", error);
      return null;
    }
  };

  // 🔥 LOGOUT
  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
    sessionStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    localStorage.removeItem("volt_current_user");

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
        register,
        loginWithGoogle,
        loginWithApple,
        beginPasskeyRegistration,
        completePasskeyRegistration,
        beginPasskeyLogin,
        completePasskeyLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
