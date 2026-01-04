"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../components/api";
import { Shell } from "../../components/layout";
import Link from "next/link";

export default function MatchesPage() {
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      const qs = new URLSearchParams();
      if (status) qs.set("status", status);
      if (date) qs.set("date", date);
      const data = await apiGet<any[]>(`/api/matches?${qs.toString()}`);
      setMatches(data);
    } catch (e: any) {
      setErr(e?.message || "Failed");
    }
  }

  useEffect(() => { load(); }, [status, date]);

  return (
    <Shell>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">All Matches</h1>
        <div className="flex gap-2 text-sm">
          <select className="border rounded-xl px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Any status</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="LIVE">Live</option>
            <option value="FINISHED">Finished</option>
          </select>
          <input className="border rounded-xl px-3 py-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {err && <div className="rounded-xl border p-3 text-sm text-red-700 mt-3">{err}</div>}

      <div className="space-y-3 mt-4">
        {matches.map((m) => (
          <Link key={m.id} href={`/match/${m.id}`} className="block rounded-2xl border p-4 hover:shadow-sm">
            <div className="text-sm text-slate-600">{m.league?.name || "League"} • {new Date(m.kickoffTime).toLocaleString()}</div>
            <div className="font-semibold">{m.homeTeam?.name} vs {m.awayTeam?.name}</div>
            <div className="text-sm mt-1">Score: {m.score || "0-0"} • Status: {m.status}</div>
          </Link>
        ))}
        {matches.length === 0 && <div className="text-slate-600">No matches found.</div>}
      </div>
    </Shell>
  );
}
