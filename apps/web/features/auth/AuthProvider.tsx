"use client";

import { createContext, useEffect, useState, useRef } from "react";
import { type User, getSession } from "./auth.service";

type Auth =
  | {
      isLoading: false;
      isAuthenticated: true;
      user: User;
    }
  | { isLoading: true; isAuthenticated: false; user: null }
  | { isLoading: false; isAuthenticated: false; user: null };

const AuthContext = createContext<Auth | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<Auth>({ isLoading: true, isAuthenticated: false, user: null });
  const isCheckingRef = useRef(false);

  useEffect(() => {
    // Auth kontrolünü tamamen kaldır - sadece localStorage'dan oku
    const checkAuth = () => {
      if (isCheckingRef.current) return; // Zaten kontrol ediliyorsa bekle
      isCheckingRef.current = true;

      try {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          setAuth({
            isLoading: false,
            isAuthenticated: true,
            user: user,
          });
        } else {
          setAuth({
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
        }
      } catch (error) {
        setAuth({
          isLoading: false,
          isAuthenticated: false,
          user: null,
        });
      } finally {
        isCheckingRef.current = false;
      }
    };

    checkAuth();

    // localStorage değişikliklerini dinle (sadece başka tab'dan gelen değişiklikler için)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'user') {
        console.log('Storage değişti, auth kontrol ediliyor...');
        checkAuth();
      }
    };

    // Custom event dinle (aynı tab içinde localStorage değişiklikleri için)
    const handleCustomStorageChange = () => {
      console.log('Custom storage event, auth kontrol ediliyor...');
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('custom-storage-change', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('custom-storage-change', handleCustomStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
export type { Auth };
