"use client";

import { useState, useEffect } from "react";
import {
  Crown,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  getSubscription,
  cancelSubscription,
  reactivateSubscription,
  createPortalSession,
} from "@/components/billingApi";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Shell } from "@/components/layout";

interface Subscription {
  status: string;
  plan: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await getSubscription();
      setSubscription(data as Subscription);
    } catch (err: any) {
      console.error("Failed to load subscription:", err);
      setError(err.message || "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll retain access until the end of your billing period.",
      )
    ) {
      return;
    }

    try {
      setActionLoading("cancel");
      setError(null);
      await cancelSubscription();
      setSuccess(
        "Subscription will be canceled at the end of the billing period",
      );
      await loadSubscription();
    } catch (err: any) {
      setError(err.message || "Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setActionLoading("reactivate");
      setError(null);
      await reactivateSubscription();
      setSuccess("Subscription reactivated successfully");
      await loadSubscription();
    } catch (err: any) {
      setError(err.message || "Failed to reactivate subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      setActionLoading("portal");
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || "Failed to open billing portal");
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Active
          </span>
        );
      case "past_due":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Past Due
          </span>
        );
      case "canceled":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Canceled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-500/20 border border-slate-500/30 rounded-full text-slate-400 text-sm font-medium">
            Inactive
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <Shell className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Account Dashboard
          </h1>
          <p className="text-slate-400">Manage your subscription and billing</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </p>
          </div>
        )}

        {/* Subscription Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {subscription?.plan
                    ? `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan`
                    : "Free Plan"}
                </h2>
                <p className="text-slate-400 text-sm">Current subscription</p>
              </div>
            </div>
            {getStatusBadge(subscription?.status || "inactive")}
          </div>

          {/* Subscription Details */}
          <div className="space-y-4 mb-6">
            {subscription?.plan && (
              <>
                <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CreditCard className="w-5 h-5" />
                    <span>Billing Cycle</span>
                  </div>
                  <span className="text-white font-medium capitalize">
                    {subscription.plan}
                  </span>
                </div>

                {subscription.currentPeriodStart && (
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-5 h-5" />
                      <span>Current Period Start</span>
                    </div>
                    <span className="text-white font-medium">
                      {new Date(
                        subscription.currentPeriodStart,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {subscription.currentPeriodEnd && (
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-5 h-5" />
                      <span>
                        {subscription.cancelAtPeriodEnd
                          ? "Access Until"
                          : "Next Billing Date"}
                      </span>
                    </div>
                    <span className="text-white font-medium">
                      {new Date(
                        subscription.currentPeriodEnd,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {subscription.cancelAtPeriodEnd && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <p className="text-orange-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Your subscription is set to cancel at the end of the
                      billing period
                    </p>
                  </div>
                )}
              </>
            )}

            {!subscription?.plan && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm mb-3">
                  You're currently on the free plan. Upgrade to Premium to
                  unlock exclusive features!
                </p>
                <button
                  onClick={() => router.push("/pricing")}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  View Premium Plans
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {subscription?.plan && subscription.status === "active" && (
            <div className="flex gap-4">
              <button
                onClick={handleManageBilling}
                disabled={actionLoading === "portal"}
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading === "portal" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    <span>Manage Billing</span>
                  </>
                )}
              </button>

              {subscription.cancelAtPeriodEnd ? (
                <button
                  onClick={handleReactivateSubscription}
                  disabled={actionLoading === "reactivate"}
                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === "reactivate" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Reactivate Subscription"
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCancelSubscription}
                  disabled={actionLoading === "cancel"}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === "cancel" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Cancel Subscription"
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Features Overview */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4">
            Your Active Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {(subscription?.status === "active"
              ? [
                  "Live HD Streaming",
                  "AI Match Analysis",
                  "Advanced Statistics",
                  "Ad-Free Experience",
                  "Priority Support",
                  "Custom Profiles",
                  "Exclusive Tournaments",
                  "Premium Badges",
                ]
              : [
                  "Match Browsing",
                  "Basic Statistics",
                  "Score Updates",
                  "Community Chat",
                  "Standard Matchmaking",
                ]
            ).map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-slate-300 bg-slate-700/30 rounded-lg p-3"
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
