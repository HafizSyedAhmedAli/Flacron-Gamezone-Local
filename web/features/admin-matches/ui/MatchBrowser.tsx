"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Sparkles,
  Filter,
} from "lucide-react";
import type { AdminMatch } from "../api/matchesApi";
import type { League } from "@/entities/league/model/types";

interface MatchBrowserProps {
  matches: AdminMatch[];
  leagues: League[];
  onEdit: (match: AdminMatch) => void;
  onDelete: (match: AdminMatch) => void;
  onAdd: () => void;
  onSync: () => void;
  onGenerateAI: (id: string) => void;
  syncing: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  statusFilter: string;
  leagueFilter: string;
  onStatusFilterChange: (v: string) => void;
  onLeagueFilterChange: (v: string) => void;
}

export function MatchBrowser({
  matches,
  leagues,
  onEdit,
  onDelete,
  onAdd,
  onSync,
  onGenerateAI,
  syncing,
  currentPage,
  totalPages,
  onPageChange,
  statusFilter,
  leagueFilter,
  onStatusFilterChange,
  onLeagueFilterChange,
}: MatchBrowserProps) {
  const [search, setSearch] = useState("");

  const filtered = matches.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.homeTeam.name.toLowerCase().includes(q) ||
      m.awayTeam.name.toLowerCase().includes(q) ||
      (m.league?.name ?? "").toLowerCase().includes(q)
    );
  });

  const statusColors: Record<string, string> = {
    LIVE: "bg-red-500/20 text-red-400 border-red-500/30",
    FINISHED: "bg-green-500/20 text-green-400 border-green-500/30",
    UPCOMING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(d));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search matches…"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-blue-500/50"
        >
          <option value="">All Statuses</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="LIVE">Live</option>
          <option value="FINISHED">Finished</option>
        </select>
        <select
          value={leagueFilter}
          onChange={(e) => onLeagueFilterChange(e.target.value)}
          className="px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-blue-500/50"
        >
          <option value="">All Leagues</option>
          {leagues.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <button
          onClick={onSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 rounded-xl text-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />{" "}
          Sync Live
        </button>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Add Match
        </button>
      </div>
      <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr className="text-xs text-slate-400 uppercase tracking-wider">
              <th className="text-left px-4 py-3">Match</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">
                League
              </th>
              <th className="text-left px-4 py-3 hidden md:table-cell">
                Kickoff
              </th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-500">
                  No matches found
                </td>
              </tr>
            ) : (
              filtered.map((match) => (
                <tr
                  key={match.id}
                  className="border-t border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">
                      {match.homeTeam.name}{" "}
                      <span className="text-slate-500 text-xs">vs</span>{" "}
                      {match.awayTeam.name}
                    </div>
                    {match.score && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        {match.score}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400 hidden lg:table-cell">
                    {match.league?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell">
                    {formatDate(match.kickoffTime)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border ${statusColors[match.status] ?? ""}`}
                    >
                      {match.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onGenerateAI(match.id)}
                        className="p-1.5 hover:bg-slate-700 rounded-lg"
                        title="Generate AI"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      </button>
                      <button
                        onClick={() => onEdit(match)}
                        className="p-1.5 hover:bg-slate-700 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                      <button
                        onClick={() => onDelete(match)}
                        className="p-1.5 hover:bg-slate-700 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm disabled:opacity-40"
          >
            ←
          </button>
          <span className="text-sm text-slate-400">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
