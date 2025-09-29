import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetProductTypes = () => {
  return useQuery({
    queryKey: ["productTypes"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/product-types', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch product types');
      return response.json();
    },
  });
};

export const useCreateProductType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/product-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create product type');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
    },
  });
};

export const useUpdateProductType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3015/api/v1/product-types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update product type');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
    },
  });
};

export const useDeleteProductType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3015/api/v1/product-types/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete product type');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
    },
  });
};

export const useProductTypes = useGetProductTypes;
