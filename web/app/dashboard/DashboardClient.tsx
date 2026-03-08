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
  Zap,
  Shield,
  Star,
  Play,
  TrendingUp,
  Sparkles,
  Trophy,
  ChevronRight,
  Search,
  Users,
  LayoutDashboard,
  User,
} from "lucide-react";
import {
  getSubscription,
  cancelSubscription,
  reactivateSubscription,
  createPortalSession,
} from "@/components/billingApi";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/layout";
import { DeleteConfirmModal } from "@/components/ui/admin/DeleteConfirmModal";
import { getToken } from "@/components/api";
import Link from "next/link";

interface Subscription {
  status: string;
  plan: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

const PREMIUM_FEATURES = [
  {
    icon: Play,
    label: "Live HD Streaming",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Sparkles,
    label: "AI Match Analysis",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: TrendingUp,
    label: "Advanced Statistics",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Shield,
    label: "Ad-Free Experience",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Zap,
    label: "Priority Support",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Star,
    label: "Custom Profiles",
    color: "from-blue-500 to-violet-500",
  },
  {
    icon: Trophy,
    label: "Exclusive Tournaments",
    color: "from-yellow-500 to-amber-500",
  },
  {
    icon: Crown,
    label: "Premium Badges",
    color: "from-purple-500 to-pink-500",
  },
];

const FREE_FEATURES = [
  { icon: Play, label: "Match Browsing", color: "from-slate-500 to-slate-600" },
  {
    icon: TrendingUp,
    label: "Basic Statistics",
    color: "from-slate-500 to-slate-600",
  },
  { icon: Zap, label: "Score Updates", color: "from-slate-500 to-slate-600" },
  { icon: Star, label: "Community Chat", color: "from-slate-500 to-slate-600" },
  {
    icon: Shield,
    label: "Standard Matchmaking",
    color: "from-slate-500 to-slate-600",
  },
];

// ── Quick action cards shown at the top ──────────────────────────────────────
const QUICK_ACTIONS = [
  {
    label: "Search",
    desc: "Find leagues, teams & matches",
    icon: Search,
    href: null, // handled by onClick to open search overlay
    action: "search",
    gradient: "from-blue-600 to-cyan-500",
    shadow: "shadow-cyan-500/20",
  },
  {
    label: "Live Matches",
    desc: "Watch what's on right now",
    icon: Play,
    href: "/live",
    action: null,
    gradient: "from-red-600 to-orange-500",
    shadow: "shadow-red-500/20",
  },
  {
    label: "Leagues",
    desc: "Browse all competitions",
    icon: Trophy,
    href: "/leagues",
    action: null,
    gradient: "from-yellow-500 to-amber-500",
    shadow: "shadow-yellow-500/20",
  },
  {
    label: "Matches",
    desc: "Upcoming & finished games",
    icon: Calendar,
    href: "/matches",
    action: null,
    gradient: "from-purple-600 to-pink-500",
    shadow: "shadow-purple-500/20",
  },
];

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const router = useRouter();

  // Decode a simple display name from the JWT (no extra API call needed)
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    try {
      const token = getToken();
      if (token) {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        setUserEmail(payload.email || payload.sub || null);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubscription();
      setSubscription(data as Subscription);
    } catch (err: any) {
      setError(err.message || "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      setActionLoading("cancel");
      setError(null);
      setSuccess(null);
      await cancelSubscription();
      setSuccess("Subscription canceled successfully.");
      setShowCancelModal(false);
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
      setSuccess(null);
      await reactivateSubscription();
      setSuccess("Subscription reactivated successfully.");
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
      setError(null);
      setSuccess(null);
      const { url } = await createPortalSession();
      if (!url) throw new Error("Invalid billing portal URL");
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || "Failed to open billing portal");
      setActionLoading(null);
    }
  };

  const isActive = subscription?.status === "active";
  const isPastDue = subscription?.status === "past_due";
  const isCanceled = subscription?.status === "canceled";
  const hasPlan = !!subscription?.plan;
  const features = isActive ? PREMIUM_FEATURES : FREE_FEATURES;

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "active")
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 animate-pulse">
          <span className="w-1.5 h-1.5 bg-white rounded-full" />
          ACTIVE
        </span>
      );
    if (status === "past_due")
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30">
          <AlertCircle className="w-3 h-3" />
          PAST DUE
        </span>
      );
    if (status === "canceled")
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 text-slate-200">
          <XCircle className="w-3 h-3" />
          CANCELED
        </span>
      );
    return (
      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
        INACTIVE
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <Shell className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/30 to-purple-900/30 border border-slate-700/50 rounded-2xl shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="max-w-xl">
                {isActive ? (
                  <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-2 mb-4 backdrop-blur-sm">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-emerald-400">
                      Premium Active
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-slate-700/50 border border-slate-600/30 rounded-full px-4 py-2 mb-4 backdrop-blur-sm">
                    <span className="w-2 h-2 bg-slate-400 rounded-full" />
                    <span className="text-sm font-semibold text-slate-400">
                      Free Plan
                    </span>
                  </div>
                )}

                <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent leading-tight">
                  Account
                  <br />
                  Dashboard
                </h1>
                <p className="text-slate-300 text-lg">
                  Manage your subscription, billing, and account preferences.
                </p>
              </div>

              {/* Account info pill */}
              {userEmail && (
                <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/40 rounded-xl px-4 py-3 backdrop-blur-sm self-start">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      Signed in as
                    </p>
                    <p className="text-sm text-white font-bold truncate max-w-[180px]">
                      {userEmail}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-5 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white capitalize">
                    {subscription?.plan || "Free"}
                  </div>
                  <div className="text-xs text-slate-400">Current Plan</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {features.length}
                  </div>
                  <div className="text-xs text-slate-400">Active Features</div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <LayoutDashboard className="w-3.5 h-3.5" /> Quick Actions
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              const inner = (
                <div
                  className={`group relative bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/40 hover:border-slate-600/60 rounded-xl p-4 transition-all duration-200 hover:scale-[1.03] cursor-pointer shadow-lg ${action.shadow} h-full`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white font-bold text-sm">{action.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{action.desc}</p>
                  <ChevronRight className="absolute top-4 right-4 w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              );

              if (action.href) {
                return (
                  <Link key={action.label} href={action.href}>
                    {inner}
                  </Link>
                );
              }
              // Search — dispatch a custom event that the layout's overlay listens to
              return (
                <button
                  key={action.label}
                  className="text-left h-full"
                  onClick={() => {
                    // Trigger the search overlay via a custom event
                    window.dispatchEvent(new CustomEvent("fgz:open-search"));
                  }}
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Notifications ── */}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-900/30 border border-emerald-700/50 rounded-xl p-4 text-emerald-400 text-sm backdrop-blur-xl">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-red-900/30 border border-red-700/50 rounded-xl p-4 text-red-400 text-sm backdrop-blur-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Main Grid ── */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Subscription card — 3 cols */}
          <div className="lg:col-span-3">
            <div className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/40 rounded-xl p-6 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 rounded-xl pointer-events-none" />

              {/* Card header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-md" />
                    <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      {hasPlan
                        ? `${subscription!.plan!.charAt(0).toUpperCase() + subscription!.plan!.slice(1)} Plan`
                        : "Free Plan"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Current subscription
                    </p>
                  </div>
                </div>
                <StatusBadge status={subscription?.status || "inactive"} />
              </div>

              {/* Details rows */}
              {hasPlan && (
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between bg-slate-800/70 backdrop-blur-sm border border-slate-600/30 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <CreditCard className="w-4 h-4" />
                      Billing Cycle
                    </div>
                    <span className="text-white text-sm font-bold capitalize">
                      {subscription!.plan}
                    </span>
                  </div>
                  {subscription!.currentPeriodStart && (
                    <div className="flex items-center justify-between bg-slate-800/70 backdrop-blur-sm border border-slate-600/30 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        Period Start
                      </div>
                      <span className="text-white text-sm font-bold">
                        {new Date(
                          subscription!.currentPeriodStart,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {subscription!.currentPeriodEnd && (
                    <div className="flex items-center justify-between bg-slate-800/70 backdrop-blur-sm border border-slate-600/30 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {subscription!.cancelAtPeriodEnd
                          ? "Access Until"
                          : "Next Billing"}
                      </div>
                      <span className="text-white text-sm font-bold">
                        {new Date(
                          subscription!.currentPeriodEnd,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {subscription!.cancelAtPeriodEnd && (
                    <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-700/40 rounded-lg px-4 py-3 text-amber-400 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Subscription set to cancel at the end of the billing
                      period.
                    </div>
                  )}
                </div>
              )}

              {/* Free plan upsell */}
              {!hasPlan && (
                <div className="mb-6 bg-blue-900/20 border border-blue-700/40 rounded-xl p-5">
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    You're on the free plan. Upgrade to Premium to unlock live
                    streaming, AI analysis, and exclusive tournaments.
                  </p>
                  <button
                    onClick={() => router.push("/pricing")}
                    className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-5 py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    View Premium Plans — $47.99/mo
                  </button>
                </div>
              )}

              {/* Action buttons */}
              {hasPlan && (isActive || isPastDue) && (
                <div className="space-y-3">
                  {/* Upgrade / change plan — most prominent */}
                  <button
                    onClick={() => router.push("/pricing")}
                    className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-5 py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <Crown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Upgrade / Change Plan
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={handleManageBilling}
                      disabled={actionLoading !== null}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-blue-600 hover:to-blue-500 border border-slate-600/50 rounded-lg px-4 py-3 text-sm font-semibold text-slate-200 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none shadow-lg"
                    >
                      {actionLoading === "portal" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          Manage Billing
                        </>
                      )}
                    </button>

                    {subscription!.cancelAtPeriodEnd ? (
                      <button
                        onClick={handleReactivateSubscription}
                        disabled={actionLoading !== null}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 rounded-lg px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none shadow-lg"
                      >
                        {actionLoading === "reactivate" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Reactivate
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        disabled={actionLoading !== null}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-900/50 to-red-800/50 hover:from-red-700 hover:to-red-600 border border-red-700/40 rounded-lg px-4 py-3 text-sm font-semibold text-red-300 hover:text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {actionLoading === "cancel" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Cancel Plan"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {hasPlan && isCanceled && (
                <button
                  onClick={() => router.push("/pricing")}
                  className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-5 py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
                >
                  <Crown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Resubscribe
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>

          {/* Features panel — 2 cols */}
          <div className="lg:col-span-2">
            <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 h-full">
              <div className="flex items-center gap-2 mb-5">
                <div className="inline-flex items-center gap-1.5 bg-slate-800/70 backdrop-blur-sm border border-slate-600/30 rounded-full px-3 py-1">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs font-semibold text-slate-300">
                    {isActive ? "Premium" : "Free"} Features
                  </span>
                </div>
              </div>

              <ul className="space-y-2">
                {features.map(({ icon: Icon, label, color }, i) => (
                  <li
                    key={i}
                    className="group/item flex items-center gap-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 hover:border-slate-600/50 rounded-lg px-3 py-2.5 transition-all duration-300 cursor-default"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-md shrink-0 opacity-80 group-hover/item:opacity-100 transition-opacity`}
                    >
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-slate-400 group-hover/item:text-slate-200 text-sm font-medium transition-colors flex-1">
                      {label}
                    </span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500/50 group-hover/item:text-emerald-400 shrink-0 transition-colors" />
                  </li>
                ))}
              </ul>

              {!isActive && (
                <button
                  onClick={() => router.push("/pricing")}
                  className="mt-5 w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-purple-600 hover:to-purple-500 border border-slate-600/50 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-all duration-300 hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4" />
                  Unlock all features
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showCancelModal}
        title="Cancel subscription"
        message="Are you sure you want to cancel? Your access will continue until the end of the billing period."
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
        isDeleting={actionLoading === "cancel"}
      />
    </Shell>
  );
}
