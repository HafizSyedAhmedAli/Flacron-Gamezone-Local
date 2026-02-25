import { apiGet } from "@/components/api";
import { isAdmin } from "@/lib/auth";
import { useEffect, useState } from "react";

interface SubscriptionResponse {
  status: string;
  plan: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const admin = isAdmin();

  useEffect(() => {
    apiGet<SubscriptionResponse>("/api/billing/subscription")
      .then((data) => setSubscription(data))
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false));
  }, []);

  return {
    isPremium: admin || subscription?.status === "active",
    status: subscription?.status ?? null,
    loading,
  };
}