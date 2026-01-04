"use client";

import { Shell } from "../../components/layout";
import { API_BASE, getToken } from "../../components/api";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { location.href = "/login"; return; }

    // Minimal “me” fetch: reuse login endpoint pattern by calling a protected admin/users is not ideal,
    // so for MVP we store token only. In production, add /api/me.
    setMe({ token: token.slice(0, 16) + "..." });
  }, []);

  return (
    <Shell>
      <h1 className="text-xl font-semibold mb-4">Dashboard</h1>
      <div className="rounded-2xl border p-5 space-y-2 max-w-xl">
        <div className="text-sm text-slate-600">You are logged in.</div>
        <div className="text-sm">API Base: <code className="text-xs">{API_BASE}</code></div>
        <div className="text-sm text-slate-600">
          Subscription status is stored in backend. To view all users and manage data, open Admin (admin role required).
        </div>
        <Link className="underline text-sm" href="/admin">Go to Admin</Link>
      </div>
    </Shell>
  );
}
