"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/components/api";
import { Shell } from "@/components/layout";
import Link from "next/link";
import {
  Activity,
  Trophy,
  Clock,
  MapPin,
  Tv,
  AlertCircle,
  PlayCircle,
  Radio,
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  logo: string | null;
}

interface League {
  id: string;
  name: string;
  country: string | null;
  logo: string | null;
}

interface Stream {
  type: "EMBED" | "NONE";
  provider: string | null;
  isActive: boolean;
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  league: League | null;
  kickoffTime: string;
  status: string;
  score: string | null;
  venue: string | null;
  stream: Stream | null;
}

export default function LiveMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  async function loadMatches() {
    try {
      setError("");
      const data = await apiGet<Match[]>("/api/matches/live");
      setMatches(data);
      setLastUpdate(new Date());
    } catch (e: any) {
      console.error("Error loading live matches:", e);
      setError(e?.message || "Failed to load live matches");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();

    // Auto-refresh every 45 seconds
    const interval = setInterval(() => {
      loadMatches();
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Shell className="bg-[#0a0e27] flex flex-col">
        <div className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden text-center py-16 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-2 border-cyan-500/20 rounded-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.1),transparent)]"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl shadow-cyan-500/30">
                  <Activity className="w-10 h-10 text-white" />
                </div>
                <p className="text-slate-300 font-bold text-xl">
                  ⚡ Loading live matches...
                </p>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell className="bg-[#0a0e27] flex flex-col">
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 to-red-900/50 border-2 border-red-500/50 rounded-2xl p-6 shadow-2xl shadow-red-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(239,68,68,0.2),transparent)]"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Radio className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                    Live Matches
                  </h1>
                  <p className="text-sm text-red-300 font-bold mt-1">
                    🔴 Auto-updates every 45 seconds
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400 font-semibold">
                  Last Update
                </div>
                <div className="text-sm text-white font-bold">
                  {lastUpdate ? lastUpdate.toLocaleTimeString() : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="relative overflow-hidden bg-gradient-to-br from-red-900/30 to-red-800/30 border-2 border-red-500/50 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.15),transparent)]"></div>
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-red-300 font-bold">⚠️ {error}</p>
              </div>
            </div>
          )}

          {/* Matches Grid */}
          {matches.length > 0 ? (
            <div className="grid gap-6">
              {matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/match/${match.id}`}
                  className="group relative overflow-hidden bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-2 border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 hover:scale-[1.02]"
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(6,182,212,0.1),transparent)] group-hover:bg-[radial-gradient(circle_at_30%_20%,_rgba(6,182,212,0.2),transparent)] transition-all"></div>

                  {/* Live Indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 shadow-lg">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                    <span className="text-xs font-black text-white uppercase">
                      LIVE
                    </span>
                  </div>

                  <div className="relative space-y-4">
                    {/* League Info */}
                    {match.league && (
                      <div className="flex items-center gap-3">
                        {match.league.logo ? (
                          <img
                            src={match.league.logo}
                            alt={match.league.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <Trophy className="w-8 h-8 text-cyan-400" />
                        )}
                        <div>
                          <div className="text-sm font-black text-white">
                            {match.league.name}
                          </div>
                          {match.league.country && (
                            <div className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {match.league.country}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Teams & Score */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
                      {/* Home Team */}
                      <div className="text-right">
                        {match.homeTeam.logo ? (
                          <img
                            src={match.homeTeam.logo}
                            alt={match.homeTeam.name}
                            className="w-16 h-16 object-contain ml-auto mb-2"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-2xl font-black ml-auto mb-2">
                            {match.homeTeam.name.charAt(0)}
                          </div>
                        )}
                        <div className="text-lg font-black text-white">
                          {match.homeTeam.name}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-center min-w-[100px]">
                        <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                          {match.score ?? "vs"}
                        </div>
                      </div>

                      {/* Away Team */}
                      <div className="text-left">
                        {match.awayTeam.logo ? (
                          <img
                            src={match.awayTeam.logo}
                            alt={match.awayTeam.name}
                            className="w-16 h-16 object-contain mr-auto mb-2"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-2xl font-black mr-auto mb-2">
                            {match.awayTeam.name.charAt(0)}
                          </div>
                        )}
                        <div className="text-lg font-black text-white">
                          {match.awayTeam.name}
                        </div>
                      </div>
                    </div>

                    {/* Match Info Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        {match.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="font-semibold">{match.venue}</span>
                          </div>
                        )}
                      </div>

                      {/* Stream Indicator */}
                      {match.stream?.type === "EMBED" &&
                      match.stream.isActive ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-500/30">
                          <PlayCircle className="w-4 h-4 text-green-400" />
                          <span className="text-xs font-black text-green-400 uppercase">
                            Stream Available
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg border border-slate-600/30">
                          <Tv className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-400">
                            Score Only
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-2 border-slate-700/50 rounded-2xl p-12 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(100,116,139,0.1),transparent)]"></div>
              <div className="relative">
                <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-12 h-12 text-slate-600" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">
                  No Live Matches
                </h3>
                <p className="text-slate-400 font-semibold">
                  Check back soon for live football action!
                </p>
                <div className="mt-6">
                  <Link
                    href="/matches"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Clock className="w-5 h-5" />
                    View Upcoming Matches
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
