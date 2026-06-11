import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import apiClient from '../api/client';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthCtx {
  user: AdminUser | null;
  token: string;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('skypostnews_token');
    const u = localStorage.getItem('skypostnews_user');
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('skypostnews_token', data.token);
    localStorage.setItem('skypostnews_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('skypostnews_token');
    localStorage.removeItem('skypostnews_user');
    setToken('');
    setUser(null);
  }

  return <Ctx.Provider value={{ user, token, loading, login, logout }}>{children}</Ctx.Provider>;
}

const GUEST_CTX: AuthCtx = {
  user: null,
  token: '',
  loading: false,
  login: async () => { throw new Error('Auth provider not available'); },
  logout: () => {},
};

export function useAdminAuth() {
  // Public pages (e.g. the article view) may call this outside the provider.
  // Return a safe guest context instead of crashing the whole app.
  return useContext(Ctx) ?? GUEST_CTX;
}
