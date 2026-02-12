import { apiGet, apiPost } from "./api";

export const createCheckoutSession = (plan: "monthly" | "yearly") =>
  apiPost<{ url: string }>("/api/billing/checkout", { plan });

export const getSubscription = () => apiGet("/api/billing/subscription");

export const cancelSubscription = () => apiPost("/api/billing/cancel", {});

export const reactivateSubscription = () =>
  apiPost("/api/billing/reactivate", {});

export const createPortalSession = () =>
  apiPost<{ url: string }>("/api/billing/portal", {});

export const cleanupDuplicates = () =>
  apiPost<{ message?: string; kept?: string; canceled?: string[] }>(
    "/api/billing/cleanup-duplicates",
    {},
  );
