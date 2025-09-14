// Basit auth service - Better-auth yerine
const API_BASE_URL = "http://localhost:3001/api/v1/auth";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN" | "user";
  companyId?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
}

// Sign in fonksiyonu
export const signIn = {
  email: async (credentials: { email: string; password: string }, callbacks?: {
    onSuccess?: () => void;
    onError?: (error: any) => void;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Auth service: API hatası:', errorText);
        throw new Error(`Sign in failed: ${response.status} ${response.statusText}`);
      }

      const data: AuthResponse = await response.json();
      // Token'ı localStorage'a kaydet
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Custom event dispatch et - AuthProvider'ın dinlemesi için
      window.dispatchEvent(new CustomEvent('custom-storage-change'));
      
      callbacks?.onSuccess?.();
      return data;
    } catch (error) {
      console.error('Auth service: Hata:', error);
      callbacks?.onError?.(error);
      throw error;
    }
  }
};

// Sign up fonksiyonu
export const signUp = {
  email: async (userData: { email: string; password: string; name: string; role?: string }, callbacks?: {
    onSuccess?: () => void;
    onError?: (error: any) => void;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Sign up failed');
      }

      const data: AuthResponse = await response.json();
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      callbacks?.onSuccess?.();
      return data;
    } catch (error) {
      callbacks?.onError?.(error);
      throw error;
    }
  }
};

// Sign out fonksiyonu
export const signOut = async () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/auth';
};

// Session kontrolü
export const getSession = async (): Promise<{ user: User | null }> => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return { user: null };
    }

    const response = await fetch(`${API_BASE_URL}/get-session`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { user: null };
    }

    const data = await response.json();
    return { user: data.user };
  } catch (error) {
    return { user: null };
  }
};

// Geçici useSession hook - Better-auth uyumluluğu için
export const useSession = () => {
  return {
    data: null,
    isPending: false,
    error: null
  };
};

// Export'lar yukarıda zaten yapıldı
