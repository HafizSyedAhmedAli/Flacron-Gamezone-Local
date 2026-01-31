"use client";

import { useEffect, useState } from "react";
import {
  requireAdmin,
  requireAuth,
  isAdmin,
  isAuthenticated,
} from "@/lib/auth";

/**
 * Hook to protect admin-only pages
 * Redirects to home page if user is not an admin
 */
export function useRequireAdmin() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      requireAdmin(); // verify admin
      setIsChecking(false); // done checking
    };
    check();
  }, []);

  return { isChecking };
}

/**
 * Hook to protect authenticated pages
 * Redirects to login if user is not authenticated
 */
export function useRequireAuth() {
  useEffect(() => {
    requireAuth();
  }, []);
}

/**
 * Hook to get current authentication state
 */
export function useAuth() {
  return {
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
  };
}
