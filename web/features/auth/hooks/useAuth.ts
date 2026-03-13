"use client";

import { useEffect, useState } from "react";
import {
  requireAdmin,
  requireAuth,
  isAdmin,
  isAuthenticated,
} from "../model/auth";

export function useRequireAdmin() {
  const [isChecking, setIsChecking] = useState(true);
  useEffect(() => {
    requireAdmin();
    setIsChecking(false);
  }, []);
  return { isChecking };
}

export function useRequireAuth() {
  useEffect(() => {
    requireAuth();
  }, []);
}

export function useAuth() {
  return { isAuthenticated: isAuthenticated(), isAdmin: isAdmin() };
}
