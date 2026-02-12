"use client";

import { Plus, Search, X } from "lucide-react";
import { useEffect } from "react";

interface Match {
  apiFixtureId: number;
  leagueId: number;
  leagueName: string;
  leagueLogo: string;
  homeTeam: {
    id: number;
    name: string;
    logo: string;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string;
  };
  kickoffTime: string;
  status: string;
  score: string;
  venue?: string;
  round?: string;
}

interface MatchBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  savedMatches: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddMatch: (match: Match) => void;
  leagues: any[];
  selectedLeague: string;
  onLeagueChange: (leagueId: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  isLoading?: boolean;
  pagination: {
    page: number;
    hasMore: boolean;
    loading: boolean;
    total: number;
  };
  onLoadMore: () => void;
}

export function MatchBrowser({
  isOpen,
  onClose,
  matches,
  savedMatches,
  searchTerm,
  onSearchChange,
  onAddMatch,
  leagues,
  selectedLeague,
  onLeagueChange,
  selectedDate,
  onDateChange,
  selectedStatus,
  onStatusChange,
  isLoading,
  pagination,
  onLoadMore,
}: MatchBrowserProps) {
  if (!isOpen) return null;

  useEffect(() => {
    if (!isOpen) return;
    onLeagueChange("");
  }, [isOpen]);

  const filteredMatches = matches.filter(
    (m) =>
      m.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.leagueName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    if (
      status === "LIVE" ||
      status === "1H" ||
      status === "2H" ||
      status === "HT"
    ) {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse inline-flex items-center gap-1.5 shadow-lg shadow-red-500/30">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          {status}
        </span>
      );
    } else if (status === "FT" || status === "AET" || status === "PEN") {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 text-slate-300 border border-slate-500/30">
          {status}
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
          {status}
        </span>
      );
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-browser-title"
        className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-blue-500/10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-5">
            <h2
              id="match-browser-title"
              className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent"
            >
              Browse Matches from API
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-700 hover:from-red-600 hover:to-red-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 border border-slate-600/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <select
              value={selectedLeague}
              onChange={(e) => {
                onLeagueChange(e.target.value);
                onSearchChange("");
              }}
              className="px-4 py-3 bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="">All Leagues (Today's matches)</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.apiLeagueId}>
                  {league.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/20 outline-none"
            />

            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="UPCOMING">Upcoming (Not Started)</option>
              <option value="LIVE">Live</option>
              <option value="FINISHED">Finished</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search matches by team or league..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>

        {/* Matches List */}
        <div className="overflow-y-auto p-6 space-y-3">
          {isLoading && matches.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading matches...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <p>No matches found. Try different filters.</p>
            </div>
          ) : (
            <>
              {filteredMatches.map((match) => {
                const alreadyAdded = savedMatches.some(
                  (m) => m.apiFixtureId === match.apiFixtureId,
                );
                return (
                  <div
                    key={match.apiFixtureId}
                    className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Match Info */}
                      <div className="flex-1">
                        {/* League Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          {match.leagueLogo && (
                            <img
                              src={match.leagueLogo}
                              alt={match.leagueName}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          <span className="text-xs text-slate-400 font-medium">
                            {match.leagueName}
                            {match.round && ` • ${match.round}`}
                          </span>
                        </div>

                        {/* Teams */}
                        <div className="flex items-center gap-4 mb-3">
                          {/* Home Team */}
                          <div className="flex items-center gap-2 flex-1">
                            {match.homeTeam.logo && (
                              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-1.5 flex items-center justify-center">
                                <img
                                  src={match.homeTeam.logo}
                                  alt={match.homeTeam.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                            <span className="font-semibold text-sm text-slate-100">
                              {match.homeTeam.name}
                            </span>
                          </div>

                          {/* Score/VS */}
                          <div className="text-center px-4">
                            {match.status === "NS" ? (
                              <span className="text-slate-500 text-sm font-medium">
                                vs
                              </span>
                            ) : (
                              <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                {match.score}
                              </span>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="font-semibold text-sm text-slate-100">
                              {match.awayTeam.name}
                            </span>
                            {match.awayTeam.logo && (
                              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-1.5 flex items-center justify-center">
                                <img
                                  src={match.awayTeam.logo}
                                  alt={match.awayTeam.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Time and Venue */}
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{formatDate(match.kickoffTime)}</span>
                          {match.venue && <span>• {match.venue}</span>}
                          {getStatusBadge(match.status)}
                        </div>
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => onAddMatch(match)}
                        disabled={alreadyAdded}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 shrink-0 ${
                          alreadyAdded
                            ? "bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-400 border border-green-500/30 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:scale-105 shadow-lg shadow-blue-500/20"
                        }`}
                      >
                        {alreadyAdded ? (
                          "Added ✓"
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Load More Button */}
              {pagination.hasMore && (
                <div className="pt-4">
                  <button
                    onClick={onLoadMore}
                    disabled={pagination.loading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-700 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {pagination.loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Load More (${pagination.total - matches.length} remaining)`
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
