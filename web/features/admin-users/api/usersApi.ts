import { apiGet, apiPut, apiDelete } from "@/shared/api/base";
import type { User } from "@/entities/user/model/types";

export interface AdminUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt?: string;
  subscription?: {
    id: string;
    status: string;
    plan: string | null;
    stripeSubscriptionId: string | null;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
  } | null;
}

export const getUsers = (page = 0, limit = 10, search?: string) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  return apiGet<{ users: AdminUser[]; total: number }>(
    `/api/admin/users?${params}`,
  );
};

export const updateUser = (id: string, data: { role?: string }) =>
  apiPut<AdminUser>(`/api/admin/users/${id}`, data);

export const deleteUser = (id: string) => apiDelete(`/api/admin/users/${id}`);

export const cancelUserSubscription = (id: string) =>
  apiPut(`/api/admin/users/${id}/cancel-subscription`, {});
