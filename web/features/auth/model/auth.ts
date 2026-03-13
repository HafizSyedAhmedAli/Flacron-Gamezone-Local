import { getToken } from "@/shared/api/base";

export interface User {
  id: number;
  email: string;
  role: "USER" | "ADMIN";
  subscription?: unknown;
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("fgz_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setUser(user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem("fgz_user", JSON.stringify(user));
}

export function clearUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("fgz_user");
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getUser();
}

export function isAdmin(): boolean {
  return getUser()?.role === "ADMIN";
}

export function logout() {
  localStorage.removeItem("fgz_token");
  localStorage.removeItem("fgz_user");
  window.location.href = "/login";
}

export function requireAdmin() {
  if (typeof window === "undefined") return;
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    window.location.href = "/login";
    return;
  }
  if (user.role !== "ADMIN") {
    window.location.href = "/";
    return;
  }
}

export function requireAuth() {
  if (typeof window === "undefined") return;
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    window.location.href = "/login";
    return;
  }
}
