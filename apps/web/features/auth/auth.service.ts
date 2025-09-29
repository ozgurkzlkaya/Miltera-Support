/**
 * Miltera Fixlog Frontend - Authentication Service
 * 
 * Bu dosya, authentication işlemlerini yöneten service katmanıdır.
 * React Query kullanarak API ile iletişim kurar ve authentication state'ini yönetir.
 * 
 * Özellikler:
 * - Login/Logout işlemleri
 * - Password reset işlemleri
 * - Token yönetimi (localStorage + cookies)
 * - React Query mutations
 * - Error handling
 * - Router navigation
 * 
 * API Endpoints:
 * - POST /api/v1/auth/login - Kullanıcı girişi
 * - POST /api/v1/auth/register - Kullanıcı kaydı
 * - POST /api/v1/auth/logout - Kullanıcı çıkışı
 * - POST /api/v1/auth/forgot-password - Şifre sıfırlama talebi
 * - POST /api/v1/auth/reset-password - Şifre sıfırlama
 * - POST /api/v1/auth/change-password - Şifre değiştirme
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Authentication Client
 * 
 * API ile iletişim kuran temel client fonksiyonları.
 * Her fonksiyon belirli bir authentication işlemini gerçekleştirir.
 */
export const authClient = {
  /**
   * Şifre Sıfırlama
   * 
   * Kullanıcının şifresini sıfırlar.
   * Token gerektirir (authenticated user).
   */
  resetPassword: async (data: any) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:3015/api/v1/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  /**
   * Şifre Sıfırlama Talebi
   * 
   * Kullanıcının e-postasına şifre sıfırlama linki gönderir.
   * Token gerektirmez.
   */
  requestPasswordReset: async (data: any) => {
    const response = await fetch('http://localhost:3015/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  
  /**
   * Kullanıcı Girişi
   * 
   * E-posta ve şifre ile kullanıcı girişi yapar.
   * Başarılı girişte JWT token döner.
   */
  signIn: async (data: any) => {
    const response = await fetch('http://localhost:3015/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  
  /**
   * Kullanıcı Kaydı
   * 
   * Yeni kullanıcı hesabı oluşturur.
   * E-posta, şifre ve diğer gerekli bilgileri alır.
   */
  signUp: async (data: any) => {
    const response = await fetch('http://localhost:3015/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  
  /**
   * Kullanıcı Çıkışı
   * 
   * Kullanıcıyı sistemden çıkarır.
   * LocalStorage ve cookie'lerden token'ları temizler.
   */
  signOut: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Custom event dispatch et - diğer component'lerin güncellenmesi için
    window.dispatchEvent(new Event('custom-storage-change'));
    
    return { success: true };
  },
  
  /**
   * Şifre Değiştirme
   * 
   * Kullanıcının mevcut şifresini yeni şifre ile değiştirir.
   * Token gerektirir (authenticated user).
   */
  changePassword: async (data: any) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:3015/api/v1/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
};

/**
 * Login Hook
 * 
 * React Query mutation hook'u kullanarak login işlemini yönetir.
 * Başarılı login'de token'ı localStorage'a kaydeder ve dashboard'a yönlendirir.
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch('http://localhost:3015/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    onSuccess: (data) => {
      // API response'unu kontrol et - başarılı login kontrolü
      if (data && data.success && data.data && data.data.token && data.data.user) {
        // Token'ları localStorage'a kaydet
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('auth_token', data.data.token); // AuthProvider için
        localStorage.setItem('user', JSON.stringify(data.data.user)); // Kullanıcı bilgilerini kaydet
        
        // Cookie'ye de kaydet (SSR için)
        document.cookie = `authToken=${data.data.token}; path=/; max-age=3600`;
        
        // React Query cache'ini temizle
        queryClient.invalidateQueries({ queryKey: ["auth"] });
        
        // Custom event dispatch et - diğer component'lerin güncellenmesi için
        window.dispatchEvent(new Event('custom-storage-change'));
        
        // Dashboard'a yönlendir
        window.location.replace('/dashboard');
      } else {
        // API başarısız ama HTTP 200 döndü - hata fırlat
        throw new Error(data?.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      }
    },
  });
};

/**
 * Logout Hook
 * 
 * React Query mutation hook'u kullanarak logout işlemini yönetir.
 * Token'ları temizler ve auth sayfasına yönlendirir.
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: async () => {
      // Tüm authentication verilerini temizle
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      return { success: true };
    },
    onSuccess: () => {
      // React Query cache'ini temizle
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      
      // Custom event dispatch et - diğer component'lerin güncellenmesi için
      window.dispatchEvent(new Event('custom-storage-change'));
      
      // Auth sayfasına yönlendir
      router.push('/auth');
    },
  });
};

// Client fonksiyonlarını export et - diğer component'ler tarafından kullanılabilir
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
