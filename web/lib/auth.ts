import { getToken } from "@/components/api";

export interface User {
  id: number;
  email: string;
  role: "USER" | "ADMIN";
  subscription?: any;
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
  localStorage.setItem("fgz_user", JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem("fgz_user");
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getUser();
}

export function isAdmin(): boolean {
  const user = getUser();
  return user?.role === "ADMIN";
}

export function logout() {
  localStorage.removeItem("fgz_token");
  localStorage.removeItem("fgz_user");
  window.location.href = "/";
}

/**
 * Redirect to home if user is authenticated but not an admin
 */
export function requireAdmin() {
  if (typeof window === "undefined") return;

  const token = getToken();
  const user = getUser();

  // If not authenticated at all, redirect to login
  if (!token || !user) {
    window.location.href = "/login";
    return;
  }

  // If authenticated but not admin, redirect to home
  if (user.role !== "ADMIN") {
    window.location.href = "/";
    return;
  }
}

/**
 * Redirect to home if user is not authenticated
 */
export function requireAuth() {
  if (typeof window === "undefined") return;

  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = "/login";
    return;
  }
}
