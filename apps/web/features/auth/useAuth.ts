'use client';

import { useContext } from 'react';
import { AuthContext, type Auth } from './AuthProvider';

export function useAuth(): Auth {
  const auth = useContext(AuthContext);
  
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return auth;
}