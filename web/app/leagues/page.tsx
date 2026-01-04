"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../components/api";
import { Shell } from "../../components/layout";

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<any[]>([]);
  useEffect(() => { apiGet<any[]>("/api/leagues").then(setLeagues); }, []);
  return (
    <Shell>
      <h1 className="text-xl font-semibold mb-4">Leagues</h1>
      <div className="grid md:grid-cols-2 gap-3">
        {leagues.map(l => (
          <div key={l.id} className="rounded-2xl border p-4">
            <div className="font-semibold">{l.name}</div>
            <div className="text-sm text-slate-600">{l.country || ""}</div>
          </div>
        ))}
        {leagues.length === 0 && <div className="text-slate-600">No leagues yet. Create some in Admin.</div>}
      </div>
    </Shell>
  );
}
