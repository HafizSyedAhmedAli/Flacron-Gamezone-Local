"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

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
}: TeamBrowserProps) {
  if (!isOpen) return null;

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.country.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Browse Teams from API</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

          <select
            value={selectedLeague}
            onChange={(e) => onLeagueChange(e.target.value)}
            className="w-full px-4 py-2 mb-3 bg-slate-800 border border-slate-700 rounded-lg text-sm"
          >
            <option value="">Select a league (Premier League default)</option>
            {leagues.map((league) => (
              <option key={league.id} value={league.apiLeagueId}>
                {league.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="text-center text-slate-400 py-8">
              Loading teams...
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              No teams found matching your search.
            </div>
          ) : (
            filteredTeams.map((team) => {
              const alreadyAdded = savedTeams.some(
                (t) => t.apiTeamId === team.apiTeamId,
              );
              return (
                <div
                  key={team.apiTeamId}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {team.logo && (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-12 h-12 object-contain"
                      />
                    )}
                    <div>
                      <div className="font-semibold">{team.name}</div>
                      <div className="text-sm text-slate-400">
                        {team.country}
                        {team.founded && ` • Founded ${team.founded}`}
                      </div>
                      {team.venue && (
                        <div className="text-xs text-slate-500">
                          {team.venue}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAddTeam(team)}
                    disabled={alreadyAdded}
                    className="gap-2"
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
