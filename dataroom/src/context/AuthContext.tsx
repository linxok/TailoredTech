import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser } from '@/types';
import { loginUser, registerUser, saveSession, loadSession, clearSession } from '@/db/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = loadSession();
    setUser(session);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const u = await loginUser(email, password);
    saveSession(u);
    setUser(u);
  };

  const register = async (email: string, name: string, password: string) => {
    const u = await registerUser(email, name, password);
    saveSession(u);
    setUser(u);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
