"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  Trophy,
  Clock,
  Sparkles,
  Play,
  TrendingUp,
} from "lucide-react";
import { Shell } from "@/components/layout";
import { apiGet } from "@/components/api";

interface Team {
  id: string;
  name: string;
  logo: string | null;
  apiTeamId: number | null;
}

interface League {
  id: string;
  name: string;
  country: string | null;
  logo: string | null;
  apiLeagueId: number | null;
}

interface Match {
  id: string;
  apiFixtureId: number | null;
  leagueId: string | null;
  homeTeamId: string;
  awayTeamId: string;
  kickoffTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  score: string | null;
  venue: string | null;
  league: League | null;
  homeTeam: Team;
  awayTeam: Team;
}

export default function MatchesPage() {
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all matches on mount
  useEffect(() => {
    fetchMatches();
  }, []);

  // Filter matches when filters change
  useEffect(() => {
    filterMatches();
  }, [status, date, allMatches]);

  async function fetchMatches() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet<Match[]>("/api/matches");
      setAllMatches(data);
      setMatches(data);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Failed to load matches. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  function filterMatches() {
    let filtered = [...allMatches];

    if (status) {
      filtered = filtered.filter((m) => m.status === status);
    }

    if (date) {
      filtered = filtered.filter((m) => {
        const matchDate = new Date(m.kickoffTime).toISOString().split("T")[0];
        return matchDate === date;
      });
    }

    setMatches(filtered);
  }

  const getStatusBadge = (matchStatus: string) => {
    switch (matchStatus) {
      case "LIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/50 animate-pulse">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            LIVE
          </span>
        );
      case "FINISHED":
        return (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 text-slate-200">
            FINISHED
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
            UPCOMING
          </span>
        );
      default:
        return (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
            {matchStatus}
          </span>
        );
    }
  };

  const liveCount = allMatches.filter((m) => m.status === "LIVE").length;
  const upcomingCount = allMatches.filter(
    (m) => m.status === "UPCOMING",
  ).length;

  return (
    <Shell>
      <div className="space-y-6">
        {/* Hero Section with Football Field Animation */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/30 to-purple-900/30 border border-slate-700/50 rounded-2xl shadow-2xl">
          {/* Stadium Field Pattern Background */}
          <div className="absolute inset-0 opacity-5">
            {/* Horizontal field lines */}
            <div
              className="absolute top-0 left-0 right-0 h-px bg-white"
              style={{ top: "20%" }}
            ></div>
            <div
              className="absolute top-0 left-0 right-0 h-px bg-white"
              style={{ top: "40%" }}
            ></div>
            <div
              className="absolute top-0 left-0 right-0 h-0.5 bg-white"
              style={{ top: "50%" }}
            ></div>
            <div
              className="absolute top-0 left-0 right-0 h-px bg-white"
              style={{ top: "60%" }}
            ></div>
            <div
              className="absolute top-0 left-0 right-0 h-px bg-white"
              style={{ top: "80%" }}
            ></div>

            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"></div>

            {/* Penalty boxes */}
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-20 h-40 border-2 border-white border-l-0"></div>
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-20 h-40 border-2 border-white border-r-0"></div>
          </div>

          {/* Animated Glow Orbs */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/3 w-48 h-48 bg-cyan-500 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          {/* Diagonal Stripes Pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 40px)",
            }}
          ></div>

          {/* Floating Football Animation */}
          <div className="absolute top-1/2 right-10 transform -translate-y-1/2 opacity-40 hidden md:block">
            <div
              className="relative animate-bounce"
              style={{ animationDuration: "3s" }}
            >
              <svg
                width="140"
                height="140"
                viewBox="0 0 140 140"
                className="drop-shadow-2xl filter"
              >
                <defs>
                  {/* Realistic ball gradient with proper lighting */}
                  <radialGradient id="ballGradient" cx="35%" cy="35%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor="#f8f8f8" />
                    <stop offset="70%" stopColor="#e0e0e0" />
                    <stop offset="100%" stopColor="#b0b0b0" />
                  </radialGradient>

                  {/* Shadow gradient */}
                  <radialGradient id="shadowGradient" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Ground shadow */}
                <ellipse
                  cx="70"
                  cy="125"
                  rx="35"
                  ry="10"
                  fill="url(#shadowGradient)"
                />

                {/* Main ball sphere */}
                <circle cx="70" cy="70" r="50" fill="url(#ballGradient)" />

                {/* Traditional soccer ball pattern - Pentagon in center */}
                <path
                  d="M 70 30 L 85 42 L 80 62 L 60 62 L 55 42 Z"
                  fill="#000000"
                  stroke="#1a1a1a"
                  strokeWidth="0.5"
                />

                {/* Surrounding hexagons */}
                <path
                  d="M 55 42 L 42 50 L 42 66 L 55 75 L 60 62 Z"
                  fill="#ffffff"
                  stroke="#1a1a1a"
                  strokeWidth="0.5"
                  opacity="0.95"
                />

                <path
                  d="M 85 42 L 98 50 L 98 66 L 85 75 L 80 62 Z"
                  fill="#ffffff"
                  stroke="#1a1a1a"
                  strokeWidth="0.5"
                  opacity="0.95"
                />

                <path
                  d="M 60 62 L 55 75 L 60 92 L 75 92 L 80 75 L 75 62 Z"
                  fill="#ffffff"
                  stroke="#1a1a1a"
                  strokeWidth="0.5"
                  opacity="0.95"
                />

                <path
                  d="M 70 30 L 55 42 L 60 28 L 70 22 L 80 28 L 85 42 Z"
                  fill="#ffffff"
                  stroke="#1a1a1a"
                  strokeWidth="0.5"
                  opacity="0.95"
                />

                {/* Side pentagons (darker) */}
                <path
                  d="M 42 50 L 32 58 L 35 73 L 42 66 Z"
                  fill="#000000"
                  stroke="#1a1a1a"
                  strokeWidth="0.5"
                  opacity="0.85"
                />

                <path
                  d="M 98 50 L 108 58 L 105 73 L 98 66 Z"
                  fill="#000000"
                  stroke="#1a1a1a"
                  strokeWidth="0.5"
                  opacity="0.85"
                />

                <path
                  d="M 60 92 L 55 105 L 70 112 L 85 105 L 80 92 Z"
                  fill="#000000"
                  stroke="#1a1a1a"
                  strokeWidth="0.5"
                  opacity="0.85"
                />

                {/* Bottom hexagons */}
                <path
                  d="M 42 66 L 35 73 L 42 88 L 55 88 L 55 75 Z"
                  fill="#ffffff"
                  stroke="#1a1a1a"
                  strokeWidth="0.5"
                  opacity="0.9"
                />

                <path
                  d="M 98 66 L 105 73 L 98 88 L 85 88 L 85 75 Z"
                  fill="#ffffff"
                  stroke="#1a1a1a"
                  strokeWidth="0.5"
                  opacity="0.9"
                />

                {/* Realistic highlight/shine */}
                <ellipse
                  cx="55"
                  cy="50"
                  rx="18"
                  ry="12"
                  fill="white"
                  opacity="0.5"
                  transform="rotate(-25 55 50)"
                />
                <ellipse
                  cx="58"
                  cy="47"
                  rx="10"
                  ry="7"
                  fill="white"
                  opacity="0.7"
                  transform="rotate(-25 58 47)"
                />
                <ellipse
                  cx="60"
                  cy="45"
                  rx="5"
                  ry="3"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
            </div>
          </div>

          <div className="relative z-10 p-8 md:p-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2 mb-4 backdrop-blur-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-red-400">
                  {liveCount} Live Matches Now
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent leading-tight">
                Watch Football
                <br />
                Matches Live
              </h1>

              <p className="text-slate-300 text-lg mb-6 max-w-xl">
                Stream live matches, get real-time scores, and never miss a
                moment of the action.
              </p>

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {liveCount}
                    </div>
                    <div className="text-xs text-slate-400">Live Now</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {upcomingCount}
                    </div>
                    <div className="text-xs text-slate-400">Upcoming</div>
                  </div>
                </div>
              </div>

              <Link href="/live">
                <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Live Matches
                </button>
              </Link>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        </div>

        {/* Filters Section */}
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-200">Filters</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-blue-600 hover:to-blue-500 border border-slate-600/50 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
            >
              <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
              Date Filter
            </button>
            <select
              className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-purple-600 hover:to-purple-500 border border-slate-600/50 rounded-lg pl-4 pr-8 py-2 text-sm font-medium cursor-pointer transition-all duration-300 hover:scale-105 text-slate-100 min-w-[140px]"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="" className="bg-slate-900 text-slate-300">
                All Status
              </option>
              <option value="UPCOMING" className="bg-slate-900 text-blue-400">
                Upcoming
              </option>
              <option value="LIVE" className="bg-slate-900 text-red-400">
                Live
              </option>
              <option value="FINISHED" className="bg-slate-900 text-slate-400">
                Finished
              </option>
            </select>
            {(status || date) && (
              <button
                onClick={() => {
                  setStatus("");
                  setDate("");
                }}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
              >
                Clear All
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <label className="block text-xs text-slate-400 mb-2 font-medium">
                Select Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-slate-800 border border-slate-600/50 rounded-lg px-3 py-2 w-full max-w-xs text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4">Loading matches...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12 bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-700/50 rounded-xl backdrop-blur-xl">
            <div className="w-14 h-14 bg-gradient-to-br from-red-700 to-red-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-7 h-7 text-red-300" />
            </div>
            <p className="text-red-400 font-medium text-sm">{error}</p>
            <button
              onClick={fetchMatches}
              className="mt-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Matches Grid */}
        {!loading && !error && (
          <div className="space-y-6">
            {matches.map((m) => (
              <Link key={m.id} href={`/match/${m.id}`}>
                <div className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-4 transition-all duration-500 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer isolate">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 rounded-xl -z-10"></div>

                  <div className="relative">
                    <div className="flex items-center justify-center mb-3">
                      <div className="inline-flex items-center gap-1.5 bg-slate-800/70 backdrop-blur-sm border border-slate-600/30 rounded-full px-3 py-1">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs font-semibold text-slate-300">
                          {m.league?.name || "Unknown League"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative flex-shrink-0 isolate">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-md -z-10"></div>
                          {m.homeTeam?.logo ? (
                            <img
                              src={m.homeTeam.logo}
                              alt={m.homeTeam.name}
                              className="relative w-11 h-11 object-contain rounded-xl bg-white/5 border border-slate-600/50 shadow-lg p-1"
                            />
                          ) : (
                            <div className="relative w-11 h-11 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center text-xs font-bold border border-slate-600/50 shadow-lg">
                              {m.homeTeam?.name.substring(0, 3).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-base truncate block group-hover:text-blue-400 transition-colors">
                            {m.homeTeam?.name}
                          </span>
                          <span className="text-xs text-slate-500">Home</span>
                        </div>
                      </div>

                      <div className="text-center flex-shrink-0 min-w-[120px]">
                        {m.status === "FINISHED" || m.status === "LIVE" ? (
                          <>
                            <div className="text-3xl font-black mb-1.5 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
                              {m.score || "0-0"}
                            </div>
                            {getStatusBadge(m.status)}
                          </>
                        ) : (
                          <>
                            {getStatusBadge(m.status)}
                            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-1.5">
                              <Clock className="w-3 h-3" />
                              {new Date(m.kickoffTime).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                        <div className="flex-1 min-w-0 text-right">
                          <span className="font-bold text-base truncate block group-hover:text-purple-400 transition-colors">
                            {m.awayTeam?.name}
                          </span>
                          <span className="text-xs text-slate-500">Away</span>
                        </div>
                        <div className="relative flex-shrink-0 isolate">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-md -z-10"></div>
                          {m.awayTeam?.logo ? (
                            <img
                              src={m.awayTeam.logo}
                              alt={m.awayTeam.name}
                              className="relative w-11 h-11 object-contain rounded-xl bg-white/5 border border-slate-600/50 shadow-lg p-1"
                            />
                          ) : (
                            <div className="relative w-11 h-11 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center text-xs font-bold border border-slate-600/50 shadow-lg">
                              {m.awayTeam?.name.substring(0, 3).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {m.venue && (
                      <div className="text-xs text-slate-500 mt-3 text-center flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        {m.venue}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {matches.length === 0 && !loading && (
              <div className="text-center py-12 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-xl">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-7 h-7 text-slate-500" />
                </div>
                <p className="text-slate-400 font-medium text-sm">
                  No matches found
                </p>
                <p className="text-slate-600 text-xs mt-1">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
