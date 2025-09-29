import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetProductModels = () => {
  return useQuery({
    queryKey: ["productModels"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/product-models', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch product models');
      return response.json();
    },
  });
};

export const useCreateProductModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/product-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create product model');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productModels"] });
    },
  });
};

export const useUpdateProductModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3015/api/v1/product-models/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update product model');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productModels"] });
    },
  });
};

export const useDeleteProductModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3015/api/v1/product-models/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete product model');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productModels"] });
    },
  });
};

export const useProductModels = useGetProductModels;
