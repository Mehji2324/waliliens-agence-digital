import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/api/admin';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const res = await adminApi.getMe();
      if (res.success && res.data) {
        setIsAuthenticated(true);
        setAdminEmail(res.data.email);
        return true;
      }
      setIsAuthenticated(false);
      setAdminEmail(null);
      return false;
    } catch {
      setIsAuthenticated(false);
      setAdminEmail(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await adminApi.login({ email, password });
      if (res.success && res.data) {
        setIsAuthenticated(true);
        setAdminEmail(res.data.email);
        return { success: true };
      }
      return { success: false, error: res.message || 'Login failed. Please verify credentials.' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error logging in.';
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await adminApi.logout();
    } finally {
      setIsAuthenticated(false);
      setAdminEmail(null);
      setIsLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        adminEmail,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
