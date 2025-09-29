"use client";

import { createContext, useEffect, useState, useRef } from "react";
// import { getSession } from "./auth.service";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}
import { initializeWebSocket, cleanupWebSocket } from "../../lib/websocket";

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
        
        console.log('AuthProvider - Token:', token);
        console.log('AuthProvider - User:', userStr);
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          console.log('AuthProvider - Parsed user:', user);
          setAuth({
            isLoading: false,
            isAuthenticated: true,
            user: user,
          });
          
          // Initialize WebSocket connection
          initializeWebSocket(token);
        } else {
          console.log('AuthProvider - No token or user, setting unauthenticated');
          setAuth({
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          
          // Cleanup WebSocket connection
          cleanupWebSocket();
        }
      } catch (error) {
        setAuth({
          isLoading: false,
          isAuthenticated: false,
          user: null,
        });
        
        // Cleanup WebSocket connection on error
        cleanupWebSocket();
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
      // Hemen kontrol et
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
