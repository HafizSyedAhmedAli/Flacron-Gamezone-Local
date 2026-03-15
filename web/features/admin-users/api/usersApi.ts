import { apiGet, apiPut, apiDelete } from "@/shared/api/base";

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

/** Fetch paginated users with optional search. */
export const getUsers = (page = 1, limit = 10, search?: string) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  return apiGet<{ users: AdminUser[]; total: number }>(
    `/api/admin/users?${params}`,
  );
};

/** Update a user's role. */
export const updateUser = (id: string, data: { role?: string }) =>
  apiPut<AdminUser>(`/api/admin/users/${id}`, data);

/** Permanently delete a user. */
export const deleteUser = (id: string) => apiDelete(`/api/admin/users/${id}`);

/** Cancel the active subscription for a user. */
export const cancelUserSubscription = (id: string) =>
  apiPut(`/api/admin/users/${id}/cancel-subscription`, {});
