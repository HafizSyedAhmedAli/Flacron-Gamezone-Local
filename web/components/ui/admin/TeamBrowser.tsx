"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, X, Shield } from "lucide-react";

interface Team {
  apiTeamId: number;
  name: string;
  logo: string;
  country: string;
  founded?: number;
  venue?: string;
}

interface TeamBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  savedTeams: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddTeam: (team: Team) => void;
  leagues: any[];
  selectedLeague: string;
  onLeagueChange: (leagueId: string) => void;
  isLoading?: boolean;
  pagination: {
    page: number;
    hasMore: boolean;
    loading: boolean;
    total: number;
  };
  onLoadMore: () => void;
}

export function TeamBrowser({
  isOpen,
  onClose,
  teams,
  savedTeams,
  searchTerm,
  onSearchChange,
  onAddTeam,
  leagues,
  selectedLeague,
  onLeagueChange,
  isLoading,
  pagination,
  onLoadMore,
}: TeamBrowserProps) {
  if (!isOpen) return null;

  const filteredTeams = teams.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.country?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-blue-500/10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Browse Teams from API
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-700 hover:from-red-600 hover:to-red-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 border border-slate-600/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* League Filter */}
          <select
            value={selectedLeague}
            onChange={(e) => onLeagueChange(e.target.value)}
            className="w-full px-4 py-3 mb-4 bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/20 outline-none"
          >
            <option value="">Select a league (Premier League default)</option>
            {leagues.map((league) => (
              <option key={league.id} value={league.apiLeagueId}>
                {league.name}
              </option>
            ))}
          </select>

          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search teams by name or country..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>

        {/* Teams List */}
        <div className="overflow-y-auto p-6 space-y-3">
          {isLoading && teams.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading teams...</p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <p>No teams found matching your search.</p>
            </div>
          ) : (
            <>
              {filteredTeams.map((team) => {
                const alreadyAdded = savedTeams.some(
                  (t) => t.apiTeamId === team.apiTeamId,
                );
                return (
                  <div
                    key={team.apiTeamId}
                    className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {team.logo ? (
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
                          <Shield className="w-8 h-8 text-slate-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-slate-100 mb-1">
                          {team.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          {team.country}
                          {team.founded && ` • Founded ${team.founded}`}
                        </div>
                        {team.venue && (
                          <div className="text-xs text-slate-500 mt-1">
                            {team.venue}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onAddTeam(team)}
                      disabled={alreadyAdded}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
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
                      `Load More (${pagination.total - filteredTeams.length} remaining)`
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
