'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../features/auth/useAuth';
import { initializeWebSocket, cleanupWebSocket } from '../../lib/websocket';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const auth = useAuth();

  useEffect(() => {
    console.log('WebSocket Provider: Auth durumu değişti', { 
      isAuthenticated: auth.isAuthenticated, 
      user: auth.user?.email 
    });

    if (auth.isAuthenticated && auth.user) {
      // Initialize WebSocket connection when user is authenticated
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('WebSocket bağlantısı başlatılıyor...');
        initializeWebSocket(token);
      }
    } else {
      // Cleanup WebSocket connection when user is not authenticated
      console.log('WebSocket bağlantısı temizleniyor...');
      cleanupWebSocket();
    }

    // Cleanup on unmount
    return () => {
      console.log('WebSocket Provider: Component unmount, cleanup...');
      cleanupWebSocket();
    };
  }, [auth.isAuthenticated, auth.user]);

  return <>{children}</>;
};
