"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../components/api";
import { Shell } from "../../components/layout";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Trophy,
  Users,
  Shield,
  Award,
  Zap,
  Target,
} from "lucide-react";
import Link from "next/link";

export default function TeamsPage() {
  const [q, setQ] = useState("");
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const itemsPerPage = 12;

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (q) qs.set("q", q);
      const data = await apiGet<any[]>(`/api/teams?${qs.toString()}`);
      setTeams(data);
    } catch (error) {
      console.error("Failed to load teams:", error);
      setError(error instanceof Error ? error.message : "Failed to load teams");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    setPage(0);
  }, [q]);

  // Filter teams based on search
  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(q.toLowerCase()) ||
      (t.league?.name || "").toLowerCase().includes(q.toLowerCase()),
  );

  const paginatedTeams = filteredTeams.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const totalMatches = Math.floor(
    teams.reduce((acc, t) => acc + (t.matches || 0), 0) / 2,
  );
  const totalWins = teams.reduce((acc, t) => acc + (t.wins || 0), 0);

  return (
    <Shell>
      {error && <div className="text-center py-8 text-red-400">{error}</div>}
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 border border-slate-700/50 p-8 md:p-12">
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm font-medium text-blue-400">
                <Zap className="w-4 h-4" />
                <span>Live Tournament</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                  Compete with the Best
                </span>
              </h1>

              <p className="text-slate-400 text-lg max-w-2xl">
                Browse all competing teams, track their performance, and follow
                the action in real-time.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {teams.length}
                    </div>
                    <div className="text-sm text-slate-400">Active Teams</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {totalMatches}
                    </div>
                    <div className="text-sm text-slate-400">Total Matches</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {totalWins}
                    </div>
                    <div className="text-sm text-slate-400">Total Wins</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className="w-full md:w-auto md:min-w-[320px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors" />
                <input
                  className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-800/70 transition-all duration-300 placeholder:text-slate-500"
                  placeholder="Search teams or leagues..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Header with pagination */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="font-medium text-white">
              {filteredTeams.length}
            </span>
            <span>teams found</span>
          </div>

          {filteredTeams.length > itemsPerPage && (
            <div className="flex gap-2 items-center bg-slate-900/50 rounded-xl px-2 py-2 border border-slate-700/50">
              <button
                onClick={handlePrevPage}
                disabled={page === 0}
                className="hover:bg-blue-500/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg px-3 py-2 transition-all duration-200 hover:text-blue-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center px-3 text-sm font-medium min-w-[60px] justify-center">
                <span className="text-blue-400">{page + 1}</span>
                <span className="text-slate-600 mx-1.5">/</span>
                <span className="text-slate-400">{totalPages}</span>
              </div>
              <button
                onClick={handleNextPage}
                disabled={page >= totalPages - 1}
                className="hover:bg-blue-500/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg px-3 py-2 transition-all duration-200 hover:text-blue-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-5 animate-pulse"
              >
                <div className="w-20 h-20 bg-slate-700/50 rounded-lg mb-3 mx-auto" />
                <div className="h-3 bg-slate-700/50 rounded w-3/4 mx-auto mb-2" />
                <div className="h-2 bg-slate-700/50 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : paginatedTeams.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {paginatedTeams.map((t, idx) => {
              const winRate =
                t.wins && t.matches
                  ? Math.round((t.wins / t.matches) * 100)
                  : 0;

              return (
                <Link
                  key={t.id}
                  href={`/teams/${t.id}`}
                  className="group bg-gradient-to-b from-slate-900/40 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer relative overflow-hidden block"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s both`,
                  }}
                >
                  {/* Hover glow effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.08), transparent 70%)`,
                    }}
                  />

                  {/* Team Logo */}
                  <div className="relative mb-4 mx-auto w-24 h-24">
                    <div className="relative group-hover:scale-110 transition-transform duration-300">
                      <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center p-3 shadow-xl group-hover:shadow-2xl group-hover:border-blue-500/30 transition-all">
                        {t.logo ? (
                          <img
                            src={t.logo}
                            alt={t.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              const fallback =
                                target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full flex items-center justify-center font-bold text-3xl text-blue-400"
                          style={{ display: t.logo ? "none" : "flex" }}
                        >
                          {t.name.substring(0, 2).toUpperCase()}
                        </div>
                      </div>

                      {t.wins > 0 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-0.5">
                          <Trophy className="w-3 h-3" />
                          {t.wins}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Info */}
                  <div className="relative z-10 text-center space-y-1.5">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors duration-200">
                      {t.name}
                    </h3>

                    <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                      <Award className="w-3 h-3" />
                      <span className="line-clamp-1">
                        {t.league?.name || "—"}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-3 pt-2 text-xs border-t border-slate-700/50">
                      <div className="text-center">
                        <div className="font-semibold text-white">
                          {t.matches || 0}
                        </div>
                        <div className="text-slate-500 text-[10px]">Played</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-400">
                          {winRate}%
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          Win Rate
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Border highlight on hover */}
                  <div className="absolute inset-0 border border-blue-500/0 group-hover:border-blue-500/20 rounded-xl transition-all duration-300 pointer-events-none" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-700/50">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-xl" />
              <div className="relative w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700/50">
                <Users className="w-10 h-10 text-slate-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              No Teams Found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {q
                ? "Try adjusting your search terms"
                : "Create teams in Admin to get started"}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </Shell>
  );
}
