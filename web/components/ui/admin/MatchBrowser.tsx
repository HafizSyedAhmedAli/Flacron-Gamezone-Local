"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

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

  const getStatusColor = (status: string) => {
    if (
      status === "LIVE" ||
      status === "1H" ||
      status === "2H" ||
      status === "HT"
    ) {
      return "bg-green-500/20 text-green-400";
    } else if (status === "FT" || status === "AET" || status === "PEN") {
      return "bg-slate-500/20 text-slate-400";
    } else {
      return "bg-blue-500/20 text-blue-400";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Browse Matches from API</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <select
              value={selectedLeague}
              onChange={(e) => {
                onLeagueChange(e.target.value);
                onSearchChange(""); // ✅ reset search
              }}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
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
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
            />

            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
            >
              <option value="">All Statuses</option>
              <option value="UPCOMING">Upcoming (Not Started)</option>
              <option value="LIVE">Live</option>
              <option value="FINISHED">Finished</option>
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="text-center text-slate-400 py-8">
              Loading matches...
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              No matches found. Try different filters.
            </div>
          ) : (
            filteredMatches.map((match) => {
              const alreadyAdded = savedMatches.some(
                (m) => m.apiFixtureId === match.apiFixtureId,
              );
              return (
                <div
                  key={match.apiFixtureId}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Match Info */}
                    <div className="flex-1">
                      {/* League Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        {match.leagueLogo && (
                          <img
                            src={match.leagueLogo}
                            alt={match.leagueName}
                            className="w-5 h-5 object-contain"
                          />
                        )}
                        <span className="text-xs text-slate-400">
                          {match.leagueName}
                          {match.round && ` - ${match.round}`}
                        </span>
                      </div>

                      {/* Teams */}
                      <div className="flex items-center gap-4">
                        {/* Home Team */}
                        <div className="flex items-center gap-2 flex-1">
                          {match.homeTeam.logo && (
                            <img
                              src={match.homeTeam.logo}
                              alt={match.homeTeam.name}
                              className="w-8 h-8 object-contain"
                            />
                          )}
                          <span className="font-semibold text-sm">
                            {match.homeTeam.name}
                          </span>
                        </div>

                        {/* Score/VS */}
                        <div className="text-center px-3">
                          {match.status === "NS" ? (
                            <span className="text-slate-500 text-sm">vs</span>
                          ) : (
                            <span className="font-bold text-lg">
                              {match.score}
                            </span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="font-semibold text-sm">
                            {match.awayTeam.name}
                          </span>
                          {match.awayTeam.logo && (
                            <img
                              src={match.awayTeam.logo}
                              alt={match.awayTeam.name}
                              className="w-8 h-8 object-contain"
                            />
                          )}
                        </div>
                      </div>

                      {/* Time and Venue */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span>{formatDate(match.kickoffTime)}</span>
                        {match.venue && <span>• {match.venue}</span>}
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                            match.status,
                          )}`}
                        >
                          {match.status}
                        </span>
                      </div>
                    </div>

                    {/* Add Button */}
                    <Button
                      size="sm"
                      onClick={() => onAddMatch(match)}
                      disabled={alreadyAdded}
                      className="gap-2 shrink-0"
                    >
                      {alreadyAdded ? (
                        "Added ✓"
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
