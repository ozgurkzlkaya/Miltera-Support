import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export const useGetCompany = (id: string) => {
  return useQuery({
    queryKey: ["company", id],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3015/api/v1/companies/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch company');
      return response.json();
    },
    enabled: !!id,
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

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3015/api/v1/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update company');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3015/api/v1/companies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete company');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const useCompanies = useGetCompanies;
