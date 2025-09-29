import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable from "../../components/DataTable";

export const useGetLocations = () => {
  return useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/locations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch locations');
      return response.json();
    },
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3015/api/v1/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create location');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3015/api/v1/locations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update location');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3015/api/v1/locations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete location');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};

export const useLocations = useGetLocations;
export { DataTable };
