import { apiGet } from "@/components/api";
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

  useEffect(() => {
    apiGet<SubscriptionResponse>("/api/billing/subscription")
      .then((data) => setSubscription(data))
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false));
  }, []);

  return {
    isPremium: subscription?.status === "active",
    status: subscription?.status ?? null,
    loading,
  };
}