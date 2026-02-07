"use client";

import { useState, useEffect } from "react";
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  Shield,
  Clock,
  CreditCard,
  HelpCircle,
  Star,
  Loader2,
} from "lucide-react";
import { createCheckoutSession } from "@/components/billingApi";
import { useRouter } from "next/navigation";
import { getToken } from "@/components/api";
import { Shell } from "@/components/layout";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [loading, setLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = async (plan: "free" | "premium") => {
    const token = getToken();
    if (!token) {
      router.push("/login?redirect=/pricing");
      return;
    }

    if (plan === "free") {
      router.push("/dashboard");
      return;
    }

    try {
      setLoading(plan);
      setError(null);

      const { url } = await createCheckoutSession(billingCycle);

      if (!url) {
        throw new Error("Invalid checkout URL received");
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error("Checkout failed:", error);
      setError(error.message || "Failed to start checkout. Please try again.");
      setLoading(null);
    }
  };

  const monthlyPrice = 9.99;
  const yearlyPrice = 99.99;
  const yearlyMonthlyEquivalent = (yearlyPrice / 12).toFixed(2);

  return (
    <Shell className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s", animationDelay: "2s" }}
        ></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
            <Crown className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-semibold">
              Premium Gaming Experience
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
            Level Up Your Gaming
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the perfect plan for your Flacron GameZone experience. Unlock
            exclusive features and dominate the competition.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Billing Toggle */}
        <div
          className={`flex justify-center mb-12 transition-all duration-1000 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center bg-slate-800/50 border border-slate-700/50 rounded-xl p-1.5 backdrop-blur-xl shadow-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              disabled={loading !== null}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                billingCycle === "monthly"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/30"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              disabled={loading !== null}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 relative ${
                billingCycle === "yearly"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/30"
              }`}
            >
              Yearly
              <span
                className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold animate-bounce"
                style={{ animationDuration: "2s" }}
              >
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Free Plan */}
          <div
            className={`relative group transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>

            <div className="relative bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Free Tier</h2>
                  <p className="text-sm text-slate-400">
                    Perfect for casual gamers
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">Free forever</p>
              </div>

              <button
                onClick={() => handleCheckout("free")}
                disabled={loading === "free"}
                className="w-full py-3 px-6 rounded-xl border-2 border-slate-600 text-white font-semibold hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-300 mb-8 hover:transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === "free" ? "Processing..." : "Get Started Free"}
              </button>

              <div className="space-y-4">
                {[
                  "Browse game lobbies & tournaments",
                  "Basic player statistics",
                  "Match score updates",
                  "Community chat access",
                  "Standard matchmaking",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-slate-300 animate-slideIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Premium Plan */}
          <div
            className={`relative group transition-all duration-1000 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 animate-pulse"
                style={{ animationDuration: "2s" }}
              >
                <Star className="w-4 h-4" />
                MOST POPULAR
              </div>
            </div>

            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500"></div>

            <div className="relative bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-2xl border-2 border-blue-500/50 rounded-2xl p-8 shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 hover:transform hover:-translate-y-2">
              <div className="flex items-center gap-3 mb-4 mt-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg relative">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 blur-md opacity-50"></div>
                  <Sparkles className="w-6 h-6 text-white relative z-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Premium Tier
                  </h2>
                  <p className="text-sm text-slate-400">
                    For competitive players
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    $
                    {billingCycle === "monthly"
                      ? monthlyPrice
                      : yearlyMonthlyEquivalent}
                  </span>
                  <span className="text-slate-400">/month</span>
                </div>
                {billingCycle === "yearly" && (
                  <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />${yearlyPrice}/year - Save $
                    {(monthlyPrice * 12 - yearlyPrice).toFixed(2)} annually
                  </p>
                )}
              </div>

              <button
                onClick={() => handleCheckout("premium")}
                disabled={loading === "premium"}
                className="relative w-full group/btn overflow-hidden mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl transition-transform duration-300 group-hover/btn:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2 py-3 text-white font-semibold">
                  {loading === "premium" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Redirecting to checkout...</span>
                    </>
                  ) : (
                    <>
                      <span>Upgrade to Premium</span>
                      <Crown className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                    </>
                  )}
                </div>
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white font-semibold pb-2 border-b border-slate-700/50">
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>Everything in Free, plus:</span>
                </div>
                {[
                  "Live tournament streaming in HD",
                  "AI-powered match analysis & predictions",
                  "Advanced player stats & heatmaps",
                  "Ad-free gaming experience",
                  "Priority matchmaking queue",
                  "Exclusive premium tournaments",
                  "Custom player profiles & badges",
                  "24/7 priority support",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-slate-300 animate-slideIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-blue-400" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div
          className={`max-w-3xl mx-auto transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-white flex items-center justify-center gap-3">
            <HelpCircle className="w-8 h-8 text-blue-400" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                question: "Can I upgrade or downgrade anytime?",
                answer:
                  "Absolutely! You can change your plan at any time from your dashboard. Changes take effect immediately, and we'll prorate any charges to ensure you only pay for what you use.",
              },
              {
                question: "Is there a free trial for Premium?",
                answer:
                  "Yes! New Flacron GameZone users get 7 days of premium access completely free. Experience all premium features with no credit card required to start your trial.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and popular digital wallets through our secure Stripe payment gateway.",
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer:
                  "Yes, you can cancel your subscription at any time with no questions asked. You'll continue to have full premium access until the end of your current billing period.",
              },
              {
                question: "Do you offer student or team discounts?",
                answer:
                  "Yes! We offer special pricing for students (with valid .edu email) and team subscriptions. Contact our support team at billing@flacrongamezone.com for custom pricing options.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300 hover:transform hover:-translate-y-1 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="font-semibold text-lg text-white mb-2 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 text-sm">?</span>
                  </div>
                  {faq.question}
                </h3>
                <p className="text-slate-400 pl-8">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div
          className={`mt-16 text-center transition-all duration-1000 delay-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="text-slate-500 text-sm mb-6">
            Trusted by over 50,000 gamers worldwide
          </p>
          <div className="flex justify-center gap-8 items-center flex-wrap">
            <div className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm font-medium">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm font-medium">Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm font-medium">Money-back Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out both;
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </Shell>
  );
}
