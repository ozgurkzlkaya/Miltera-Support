'use client';

import React, { useEffect } from 'react';
import { useSession } from '../../features/auth/auth.service';
import { initializeWebSocket, cleanupWebSocket } from '../../lib/websocket';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      // Initialize WebSocket connection when user is authenticated
      initializeWebSocket(session.accessToken);
    } else {
      // Cleanup WebSocket connection when user is not authenticated
      cleanupWebSocket();
    }

    // Cleanup on unmount
    return () => {
      cleanupWebSocket();
    };
  }, [session?.accessToken]);

  return <>{children}</>;
};
