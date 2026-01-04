"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../components/api";
import { Shell } from "../../components/layout";
import Link from "next/link";

type Match = any;

export default function LivePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [err, setErr] = useState<string>("");

  async function load() {
    try {
      setErr("");
      const data = await apiGet<Match[]>("/api/matches/live");
      setMatches(data);
    } catch (e: any) {
      setErr(e?.message || "Failed");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 45_000);
    return () => clearInterval(t);
  }, []);

  return (
    <Shell>
      <h1 className="text-xl font-semibold mb-4">Live Matches</h1>
      {err && <div className="rounded-xl border p-3 text-sm text-red-700">{err}</div>}
      <div className="space-y-3">
        {matches.map((m) => (
          <Link key={m.id} href={`/match/${m.id}`} className="block rounded-2xl border p-4 hover:shadow-sm">
            <div className="text-sm text-slate-600">{m.league?.name || "League"}</div>
            <div className="font-semibold">{m.homeTeam?.name} vs {m.awayTeam?.name}</div>
            <div className="text-sm mt-1">Score: {m.score || "0-0"} • Status: {m.status}</div>
          </Link>
        ))}
        {matches.length === 0 && <div className="text-slate-600">No live matches found.</div>}
      </div>
    </Shell>
  );
}
