"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

interface League {
  apiLeagueId: number;
  name: string;
  logo: string;
  country: string;
}

interface LeagueBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  leagues: League[];
  savedLeagues: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddLeague: (league: League) => void;
  isLoading?: boolean;
}

export function LeagueBrowser({
  isOpen,
  onClose,
  leagues,
  savedLeagues,
  searchTerm,
  onSearchChange,
  onAddLeague,
  isLoading,
}: LeagueBrowserProps) {
  if (!isOpen) return null;

  const filteredLeagues = leagues.filter(
    (l) =>
      (l.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.country ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Browse Leagues from API</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search leagues..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="text-center text-slate-400 py-8">Loading...</div>
          ) : (
            filteredLeagues.map((league) => {
              const alreadyAdded = savedLeagues.some(
                (l) => l.apiLeagueId === league.apiLeagueId,
              );
              return (
                <div
                  key={league.apiLeagueId}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {league.logo && (
                      <img
                        src={league.logo}
                        alt={league.name}
                        className="w-12 h-12 object-contain"
                      />
                    )}
                    <div>
                      <div className="font-semibold">{league.name}</div>
                      <div className="text-sm text-slate-400">
                        {league.country}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAddLeague(league)}
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
