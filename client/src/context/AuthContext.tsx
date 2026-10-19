import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, tokenStore } from '../api';
import type { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean; // true while we check a saved token on first load
  isAdmin: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load: if a token is saved, ask the server who it belongs to.
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    api<{ user: User }>('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const data = await api<AuthResponse>('/auth/signup', { method: 'POST', body: { name, email, password } });
    tokenStore.set(data.token);
    setUser(data.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
    tokenStore.set(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAdmin: user?.role === 'admin', signup, login, logout }),
    [user, loading, signup, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
