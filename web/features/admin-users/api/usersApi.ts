import { apiGet, apiPut, apiDelete } from '@/shared/api/client';
import type { AdminUser } from '@/shared/types';

export const getUsers = (page = 1, limit = 10, search?: string) => {
   const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
   });
   if (search) params.set('search', search);
   return apiGet<{ users: AdminUser[]; total: number }>(
      `/api/admin/users?${params}`
   );
};

export const updateUser = (id: string, data: { role?: string }) =>
   apiPut<AdminUser>(`/api/admin/users/${id}`, data);

export const deleteUser = (id: string) => apiDelete(`/api/admin/users/${id}`);

export const cancelUserSubscription = (id: string) =>
   apiPut(`/api/admin/users/${id}/cancel-subscription`, {});
