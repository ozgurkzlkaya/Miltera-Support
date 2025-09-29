import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const authClient = {
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
  signOut: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Custom event dispatch et
    window.dispatchEvent(new Event('custom-storage-change'));
    
    return { success: true };
  },
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
      // API response'unu kontrol et
      if (data && data.success && data.data && data.data.token && data.data.user) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('auth_token', data.data.token); // AuthProvider için
        localStorage.setItem('user', JSON.stringify(data.data.user)); // Kullanıcı bilgilerini kaydet
        document.cookie = `authToken=${data.data.token}; path=/; max-age=3600`;
        queryClient.invalidateQueries({ queryKey: ["auth"] });
        
        // Custom event dispatch et
        window.dispatchEvent(new Event('custom-storage-change'));
        
        window.location.replace('/dashboard');
      } else {
        // API başarısız ama HTTP 200 döndü
        throw new Error(data?.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      }
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      
      // Custom event dispatch et
      window.dispatchEvent(new Event('custom-storage-change'));
      
      router.push('/auth');
    },
  });
};

export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
