/**
 * Miltera Fixlog Frontend - Product Service
 * 
 * Bu dosya, ürün yönetimi için tüm API işlemlerini tanımlar.
 * React Query hooks kullanarak CRUD işlemlerini yönetir.
 * 
 * Özellikler:
 * - GET: Tüm ürünleri listele
 * - GET: Tek ürün detayı
 * - POST: Yeni ürün oluştur
 * - PUT: Ürün güncelle
 * - DELETE: Ürün sil
 * - Error handling
 * - Authentication
 * - Caching
 * 
 * API Endpoint: /api/v1/products
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Tüm ürünleri getiren hook
 * 
 * Bu hook:
 * 1. API'den tüm ürünleri çeker
 * 2. Authentication token'ı ekler
 * 3. Error handling yapar
 * 4. Caching sağlar
 * 5. Loading state yönetir
 */
export const useGetProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // Authentication token'ını al
      const token = localStorage.getItem('auth_token');
      
      // API'ye GET isteği gönder
      const response = await fetch('http://localhost:3015/api/v1/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Hata kontrolü
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch products`);
      }
      
      return response.json();
    },
  });
};

/**
 * Tek ürün detayını getiren hook
 * 
 * Bu hook:
 * 1. Belirli bir ürünün detaylarını çeker
 * 2. ID parametresi ile çalışır
 * 3. ID yoksa query'yi devre dışı bırakır
 * 4. Error handling yapar
 * 5. Caching sağlar
 */
export const useGetProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      // Authentication token'ını al
      const token = localStorage.getItem('auth_token');
      
      // API'ye GET isteği gönder
      const response = await fetch(`http://localhost:3015/api/v1/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Hata kontrolü
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch product`);
      }
      
      return response.json();
    },
    enabled: !!id, // ID varsa query'yi aktif et
  });
};

/**
 * Yeni ürün oluşturan hook
 * 
 * Bu hook:
 * 1. POST isteği ile yeni ürün oluşturur
 * 2. Form data'sını JSON'a çevirir
 * 3. Authentication token'ı ekler
 * 4. Başarılı olursa cache'i günceller
 * 5. Error handling yapar
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      // Authentication token'ını al
      const token = localStorage.getItem('auth_token');
      
      // API'ye POST isteği gönder
      const response = await fetch('http://localhost:3015/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      // Hata kontrolü
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to create product`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Başarılı olursa products cache'ini güncelle
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3015/api/v1/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3015/api/v1/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// Companies API calls
export const useGetCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/companies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create company');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};
