"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../components/api";
import { Shell } from "../../components/layout";

export default function TeamsPage() {
  const [q, setQ] = useState("");
  const [teams, setTeams] = useState<any[]>([]);

  async function load() {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    const data = await apiGet<any[]>(`/api/teams?${qs.toString()}`);
    setTeams(data);
  }

  useEffect(() => { load(); }, [q]);

  return (
    <Shell>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">Teams</h1>
        <input className="border rounded-xl px-3 py-2 text-sm" placeholder="Search teams..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid md:grid-cols-2 gap-3 mt-4">
        {teams.map(t => (
          <div key={t.id} className="rounded-2xl border p-4">
            <div className="font-semibold">{t.name}</div>
            <div className="text-sm text-slate-600">{t.league?.name || "—"}</div>
          </div>
        ))}
        {teams.length === 0 && <div className="text-slate-600">No teams yet. Create some in Admin.</div>}
      </div>
    </Shell>
  );
}
