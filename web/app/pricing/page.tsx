"use client";

import { Shell } from "../../components/layout";
import { apiPost, getToken } from "../../components/api";

export default function Pricing() {
  async function checkout(plan: "monthly" | "yearly") {
    if (!getToken()) { location.href = "/login"; return; }
    const data = await apiPost<{ url: string }>("/api/billing/checkout", { plan });
    if (data.url) location.href = data.url;
  }

  return (
    <Shell>
      <h1 className="text-xl font-semibold mb-4">Pricing</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5">
          <div className="font-semibold">Free</div>
          <div className="text-sm text-slate-600 mt-1">Browse matches, leagues, teams, scores.</div>
          <ul className="text-sm mt-3 list-disc pl-5 text-slate-700">
            <li>Match discovery</li>
            <li>Score-only mode</li>
          </ul>
        </div>

        <div className="rounded-2xl border p-5">
          <div className="font-semibold">Premium</div>
          <div className="text-sm text-slate-600 mt-1">Unlock premium match pages and features.</div>
          <ul className="text-sm mt-3 list-disc pl-5 text-slate-700">
            <li>Subscription via Stripe</li>
            <li>Future premium features</li>
          </ul>

          <div className="flex gap-2 mt-4">
            <button className="border rounded-xl px-4 py-2 text-sm" onClick={() => checkout("monthly")}>Monthly</button>
            <button className="border rounded-xl px-4 py-2 text-sm" onClick={() => checkout("yearly")}>Yearly</button>
          </div>

          <div className="text-xs text-slate-500 mt-2">Stripe must be configured in backend to use checkout.</div>
        </div>
      </div>
    </Shell>
  );
}
