"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Search,
  Download,
  Loader2,
  CheckSquare,
  Square,
  AlertCircle,
  RefreshCw,
  Calendar,
  Filter,
} from "lucide-react";
import { apiGet, apiPost } from "@/shared/api/base";
import type { League } from "@/entities/league/model/types";

interface ApiMatch {
  apiFixtureId: number;
  leagueId: number;
  leagueName: string;
  leagueLogo?: string;
  homeTeam: { id: number; name: string; logo: string | null };
  awayTeam: { id: number; name: string; logo: string | null };
  kickoffTime: string;
  status: string;
  score: string | null;
  venue: string | null;
  round?: string;
  isFuture?: boolean;
}

interface MatchApiBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
  leagues: League[];
}

export function MatchApiBrowser({
  isOpen,
  onClose,
  onImported,
  leagues,
}: MatchApiBrowserProps) {
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [filtered, setFiltered] = useState<ApiMatch[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importResults, setImportResults] = useState<{
    success: number;
    skipped: number;
  } | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    setImportResults(null);
    try {
      const params = new URLSearchParams({ page: "1", limit: "200" });
      if (selectedLeagueId) params.set("leagueId", selectedLeagueId);
      if (selectedDate) params.set("date", selectedDate);
      if (statusFilter) params.set("status", statusFilter);

      const data = await apiGet<{
        success: boolean;
        matches: ApiMatch[];
        total: number;
      }>(`/api/admin/matches/api?${params}`);
      const items = data.matches ?? [];
      setMatches(items);
      setFiltered(items);
      setSelected(new Set());
    } catch (e: any) {
      setError(e?.message || "Failed to fetch matches from Football API");
    } finally {
      setLoading(false);
    }
  }, [selectedLeagueId, selectedDate, statusFilter]);

  useEffect(() => {
    if (isOpen) {
      setSelected(new Set());
      setSearch("");
      setImportResults(null);
      setMatches([]);
      setFiltered([]);
      fetchMatches();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? matches.filter(
            (m) =>
              m.homeTeam.name.toLowerCase().includes(q) ||
              m.awayTeam.name.toLowerCase().includes(q) ||
              m.leagueName.toLowerCase().includes(q),
          )
        : matches,
    );
  }, [search, matches]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((m) => m.apiFixtureId)));
    }
  };

  const mapStatus = (apiStatus: string): "UPCOMING" | "LIVE" | "FINISHED" => {
    if (["1H", "HT", "2H", "ET", "P", "LIVE", "INT"].includes(apiStatus))
      return "LIVE";
    if (["FT", "AET", "PEN"].includes(apiStatus)) return "FINISHED";
    return "UPCOMING";
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    setError(null);
    let success = 0;
    let skipped = 0;

    for (const id of selected) {
      const match = matches.find((m) => m.apiFixtureId === id);
      if (!match) continue;
      try {
        // Find the stored league
        const league = leagues.find((l) => l.apiLeagueId === match.leagueId);
        await apiPost("/api/admin/matches", {
          apiFixtureId: match.apiFixtureId,
          leagueId: league?.id || undefined,
          homeTeamId: String(match.homeTeam.id),
          awayTeamId: String(match.awayTeam.id),
          kickoffTime: match.kickoffTime,
          status: mapStatus(match.status),
          score: match.score || undefined,
          venue: match.venue || undefined,
        });
        success++;
      } catch {
        skipped++;
      }
    }

    setImporting(false);
    setImportResults({ success, skipped });
    setSelected(new Set());
    if (success > 0) onImported();
  };

  if (!isOpen) return null;

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((m) => selected.has(m.apiFixtureId));

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(d));

  const statusColors: Record<string, string> = {
    LIVE: "bg-red-500/20 text-red-400",
    FINISHED: "bg-green-500/20 text-green-400",
    UPCOMING: "bg-blue-500/20 text-blue-400",
    "1H": "bg-red-500/20 text-red-400",
    "2H": "bg-red-500/20 text-red-400",
    HT: "bg-yellow-500/20 text-yellow-400",
    FT: "bg-green-500/20 text-green-400",
    NS: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={() => !importing && onClose()}
      />
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Import Matches from API</h2>
              <p className="text-xs text-slate-500">
                {matches.length > 0
                  ? `${matches.length} matches found`
                  : "Configure filters and fetch matches"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={importing}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-700/30 flex-shrink-0 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs text-slate-500 mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs text-slate-500 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
              >
                <option value="">All</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="LIVE">Live</option>
                <option value="FINISHED">Finished</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">
                League Filter
              </label>
              <select
                value={selectedLeagueId}
                onChange={(e) => setSelectedLeagueId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
              >
                <option value="">All Leagues</option>
                {leagues
                  .filter((l) => l.apiLeagueId != null)
                  .map((l) => (
                    <option key={l.id} value={String(l.apiLeagueId)}>
                      {l.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search team or league…"
                className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
              />
            </div>
            <button
              onClick={fetchMatches}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-900/50 disabled:opacity-50 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Fetch
            </button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <button
              onClick={toggleAll}
              disabled={loading || filtered.length === 0}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors disabled:opacity-40"
            >
              {allFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-green-400" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {allFilteredSelected ? "Deselect all" : "Select all"} (
              {filtered.length})
            </button>
            <span className="text-slate-500">{selected.size} selected</span>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
              <p className="text-sm text-slate-400">Fetching matches…</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium">{error}</p>
                <button
                  onClick={fetchMatches}
                  className="mt-2 flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            </div>
          )}

          {importResults && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-400">
              ✅ Imported {importResults.success} match(es)
              {importResults.skipped > 0 &&
                `, ${importResults.skipped} already existed or failed`}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              {matches.length === 0
                ? "Click Fetch to load matches from the Football API"
                : "No matches found for the current filters"}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map((match) => {
                const isSelected = selected.has(match.apiFixtureId);
                const mappedStatus = mapStatus(match.status);
                return (
                  <button
                    key={match.apiFixtureId}
                    onClick={() => toggleSelect(match.apiFixtureId)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-green-500/10 border-green-500/40"
                        : "bg-slate-800/30 border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-green-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </div>

                    {/* Teams */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {match.homeTeam.logo && (
                          <img
                            src={match.homeTeam.logo}
                            alt=""
                            className="w-5 h-5 object-contain"
                          />
                        )}
                        <span className="text-sm font-medium text-white truncate max-w-[100px]">
                          {match.homeTeam.name}
                        </span>
                      </div>

                      <div className="flex-shrink-0 px-2 text-xs font-bold text-slate-500">
                        {match.score ? (
                          <span className="text-white">{match.score}</span>
                        ) : (
                          "vs"
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {match.awayTeam.logo && (
                          <img
                            src={match.awayTeam.logo}
                            alt=""
                            className="w-5 h-5 object-contain"
                          />
                        )}
                        <span className="text-sm font-medium text-white truncate max-w-[100px]">
                          {match.awayTeam.name}
                        </span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-500 truncate max-w-[120px]">
                        {match.leagueName}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                          statusColors[match.status] ||
                          statusColors[mappedStatus] ||
                          "bg-slate-700/50 text-slate-400"
                        }`}
                      >
                        {match.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDate(match.kickoffTime)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700/50 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            Close
          </button>
          <button
            onClick={handleImport}
            disabled={importing || selected.size === 0}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-900/50 disabled:opacity-50 rounded-xl text-sm font-medium transition-all"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {importing
              ? "Importing…"
              : `Import ${selected.size > 0 ? selected.size : ""} Match${selected.size !== 1 ? "es" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
