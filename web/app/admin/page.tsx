"use client";

import { Shell } from "../../components/layout";
import { apiDelete, apiGet, apiPost, apiPut, getToken } from "../../components/api";
import { useEffect, useState } from "react";

export default function Admin() {
  const [tab, setTab] = useState<"leagues" | "teams" | "matches" | "users">("leagues");
  const [leagues, setLeagues] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!getToken()) { location.href = "/login"; return; }
    refreshAll();
  }, []);

  async function refreshAll() {
    const [l, t, m] = await Promise.all([
      apiGet<any[]>("/api/leagues"),
      apiGet<any[]>("/api/teams"),
      apiGet<any[]>("/api/matches")
    ]);
    setLeagues(l); setTeams(t); setMatches(m);
    try {
      const u = await apiGet<any[]>("/api/admin/users"); // will fail if not admin
      setUsers(u);
    } catch {}
  }

  async function createLeague() {
    const name = prompt("League name?");
    if (!name) return;
    await apiPost("/api/admin/league", { name, country: "", logo: "" });
    setMsg("League created");
    refreshAll();
  }

  async function createTeam() {
    const name = prompt("Team name?");
    if (!name) return;
    const leagueId = leagues[0]?.id || null;
    await apiPost("/api/admin/team", { name, leagueId, logo: "" });
    setMsg("Team created");
    refreshAll();
  }

  async function createMatch() {
    if (teams.length < 2) { alert("Create at least 2 teams first."); return; }
    const homeTeamId = teams[0].id;
    const awayTeamId = teams[1].id;
    const kickoffTime = new Date(Date.now() + 2*60*60*1000).toISOString();
    await apiPost("/api/admin/match", { homeTeamId, awayTeamId, kickoffTime, status: "UPCOMING", score: "0-0", venue: "" });
    setMsg("Match created");
    refreshAll();
  }

  return (
    <Shell>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <div className="text-xs text-slate-500">Requires ADMIN role</div>
      </div>

      {msg && <div className="mt-3 text-sm text-green-700">{msg}</div>}

      <div className="flex gap-2 mt-4 text-sm">
        <button className={`border rounded-xl px-3 py-2 ${tab==="leagues" ? "bg-slate-100" : ""}`} onClick={() => setTab("leagues")}>Leagues</button>
        <button className={`border rounded-xl px-3 py-2 ${tab==="teams" ? "bg-slate-100" : ""}`} onClick={() => setTab("teams")}>Teams</button>
        <button className={`border rounded-xl px-3 py-2 ${tab==="matches" ? "bg-slate-100" : ""}`} onClick={() => setTab("matches")}>Matches</button>
        <button className={`border rounded-xl px-3 py-2 ${tab==="users" ? "bg-slate-100" : ""}`} onClick={() => setTab("users")}>Users</button>
      </div>

      {tab === "leagues" && (
        <section className="mt-4 space-y-3">
          <button className="border rounded-xl px-4 py-2 text-sm" onClick={createLeague}>+ Create League</button>
          {leagues.map(l => (
            <div key={l.id} className="rounded-2xl border p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{l.name}</div>
                <div className="text-sm text-slate-600">{l.country || ""}</div>
              </div>
              <button className="text-sm underline" onClick={async () => { await apiDelete(`/api/admin/league/${l.id}`); refreshAll(); }}>Delete</button>
            </div>
          ))}
        </section>
      )}

      {tab === "teams" && (
        <section className="mt-4 space-y-3">
          <button className="border rounded-xl px-4 py-2 text-sm" onClick={createTeam}>+ Create Team</button>
          {teams.map(t => (
            <div key={t.id} className="rounded-2xl border p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-slate-600">{t.league?.name || "—"}</div>
              </div>
              <button className="text-sm underline" onClick={async () => { await apiDelete(`/api/admin/team/${t.id}`); refreshAll(); }}>Delete</button>
            </div>
          ))}
        </section>
      )}

      {tab === "matches" && (
        <section className="mt-4 space-y-3">
          <button className="border rounded-xl px-4 py-2 text-sm" onClick={createMatch}>+ Create Match</button>
          {matches.map(m => (
            <div key={m.id} className="rounded-2xl border p-4 space-y-1">
              <div className="font-semibold">{m.homeTeam?.name} vs {m.awayTeam?.name}</div>
              <div className="text-sm text-slate-600">{new Date(m.kickoffTime).toLocaleString()} • {m.status} • {m.score}</div>
              <div className="flex gap-2 text-sm">
                <button className="border rounded-xl px-3 py-2" onClick={async () => { await apiPut(`/api/admin/match/${m.id}`, { status: "LIVE" }); refreshAll(); }}>Set LIVE</button>
                <button className="border rounded-xl px-3 py-2" onClick={async () => { await apiPut(`/api/admin/match/${m.id}`, { status: "FINISHED" }); refreshAll(); }}>Set FINISHED</button>
                <button className="underline" onClick={async () => { await apiDelete(`/api/admin/match/${m.id}`); refreshAll(); }}>Delete</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === "users" && (
        <section className="mt-4 space-y-3">
          {users.length === 0 ? (
            <div className="text-slate-600 text-sm">If this is empty, you are not ADMIN or backend blocked the request.</div>
          ) : users.map(u => (
            <div key={u.id} className="rounded-2xl border p-4">
              <div className="font-semibold">{u.email}</div>
              <div className="text-sm text-slate-600">Role: {u.role} • Sub: {u.subscription?.status || "—"}</div>
            </div>
          ))}
        </section>
      )}
    </Shell>
  );
}
