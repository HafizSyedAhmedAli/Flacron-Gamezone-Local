"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, getToken } from "../../../components/api";
import { Shell } from "../../../components/layout";

export default function MatchDetail({ params }: { params: { id: string } }) {
  const [match, setMatch] = useState<any>(null);
  const [err, setErr] = useState("");
  const [lang, setLang] = useState<"en" | "fr">("en");

  async function load() {
    try {
      setErr("");
      const data = await apiGet(`/api/match/${params.id}`);
      setMatch(data);
    } catch (e: any) {
      setErr(e?.message || "Failed");
    }
  }

  useEffect(() => { load(); }, [params.id]);

  async function gen(kind: "match-preview" | "match-summary") {
    if (!getToken()) { location.href = "/login"; return; }
    await apiPost(`/api/ai/${kind}`, { matchId: params.id, language: lang });
    await load();
  }

  if (err) return <Shell><div className="text-red-700">{err}</div></Shell>;
  if (!match) return <Shell><div>Loading…</div></Shell>;

  const preview = (match.aiTexts || []).find((x: any) => x.kind === "preview" && x.language === lang);
  const summary = (match.aiTexts || []).find((x: any) => x.kind === "summary" && x.language === lang);

  return (
    <Shell>
      <div className="rounded-2xl border p-5 space-y-3">
        <div className="text-sm text-slate-600">{match.league?.name || "League"} • {new Date(match.kickoffTime).toLocaleString()}</div>
        <h1 className="text-xl font-semibold">{match.homeTeam?.name} vs {match.awayTeam?.name}</h1>
        <div className="text-sm">Status: <b>{match.status}</b> • Score: <b>{match.score || "0-0"}</b></div>
        {match.venue && <div className="text-sm text-slate-600">Venue: {match.venue}</div>}

        <div className="flex items-center gap-2 text-sm">
          <label className="text-slate-600">Language:</label>
          <select className="border rounded-xl px-3 py-2" value={lang} onChange={(e) => setLang(e.target.value as any)}>
            <option value="en">English</option>
            <option value="fr">French</option>
          </select>
        </div>

        <div className="rounded-2xl border p-4">
          <div className="font-semibold mb-2">Watch Live</div>
          {match.stream?.type === "EMBED" && match.stream?.isActive ? (
            <div className="text-sm text-slate-600">
              Embed is configured. (For security, this MVP renders a link instead of raw iframe.)
              <div className="mt-2">
                <a className="underline" href={match.stream.url} target="_blank">Open official stream</a>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-600">Score-only mode (no video available).</div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold">AI Match Preview</div>
              <button className="border rounded-xl px-3 py-2 text-sm" onClick={() => gen("match-preview")}>Generate</button>
            </div>
            <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{preview?.content || "No preview yet."}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold">AI Match Summary</div>
              <button className="border rounded-xl px-3 py-2 text-sm" onClick={() => gen("match-summary")}>Generate</button>
            </div>
            <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{summary?.content || "No summary yet."}</p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
