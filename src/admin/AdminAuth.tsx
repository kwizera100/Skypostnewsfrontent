import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

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
    const t = localStorage.getItem('iremee_token');
    const u = localStorage.getItem('iremee_user');
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('iremee_token', data.token);
    localStorage.setItem('iremee_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('iremee_token');
    localStorage.removeItem('iremee_user');
    setToken('');
    setUser(null);
  }

  return <Ctx.Provider value={{ user, token, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider');
  return ctx;
}
