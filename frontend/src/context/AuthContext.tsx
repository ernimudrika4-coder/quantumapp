import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  backendGetMe,
  backendLogin,
  backendRegister,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '../services/backend';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: string;
  watchlist?: string[];
  stats?: Record<string, unknown>;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  register: (payload: { name: string; email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getAuthToken());
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    const current = getAuthToken();
    if (!current) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await backendGetMe();
      setUser(me ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshMe();
  }, []);

  async function login(payload: { email: string; password: string }) {
    setLoading(true);
    try {
      const result = await backendLogin(payload);
      if (!result?.token || !result?.user) {
        return { success: false, message: 'Login gagal. Cek email/password.' };
      }
      setAuthToken(result.token);
      setTokenState(result.token);
      setUser(result.user);
      return { success: true };
    } catch {
      return { success: false, message: 'Login gagal.' };
    } finally {
      setLoading(false);
    }
  }

  async function register(payload: { name: string; email: string; password: string }) {
    setLoading(true);
    try {
      const result = await backendRegister(payload);
      if (!result?.token || !result?.user) {
        return { success: false, message: 'Register gagal.' };
      }
      setAuthToken(result.token);
      setTokenState(result.token);
      setUser(result.user);
      return { success: true };
    } catch {
      return { success: false, message: 'Register gagal.' };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearAuthToken();
    setTokenState(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout,
    refreshMe,
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
