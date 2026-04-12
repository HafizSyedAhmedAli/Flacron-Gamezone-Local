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
  Users,
  Globe,
  ChevronDown,
} from "lucide-react";
import { apiGet, apiPost } from "@/shared/api/base";
import type { League } from "@/entities/league/model/types";

interface ApiTeam {
  apiTeamId: number;
  name: string;
  logo: string | null;
  country?: string;
  founded?: number | null;
}

interface TeamApiBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
  leagues: League[];
}

const PAGE_SIZE = 100;

export function TeamApiBrowser({
  isOpen,
  onClose,
  onImported,
  leagues,
}: TeamApiBrowserProps) {
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [filtered, setFiltered] = useState<ApiTeam[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importResults, setImportResults] = useState<{
    success: number;
    skipped: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState<number | null>(null);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        });
        if (selectedLeagueId) params.set("leagueId", selectedLeagueId);

        const data = await apiGet<{
          success: boolean;
          data: ApiTeam[];
          pagination: { total: number; hasMore: boolean };
        }>(`/api/admin/teams/api?${params}`);

        const items = data.data ?? [];
        const pagination = data.pagination as any;

        if (append) {
          setTeams((prev) => {
            const existing = new Set(prev.map((t) => t.apiTeamId));
            return [
              ...prev,
              ...items.filter((t) => !existing.has(t.apiTeamId)),
            ];
          });
        } else {
          setTeams(items);
          setImportResults(null);
        }

        setHasMore(pagination?.hasMore ?? items.length === PAGE_SIZE);
        setTotalAvailable(pagination?.total ?? null);
        setCurrentPage(page);
      } catch (e: any) {
        setError(e?.message || "Failed to fetch teams from Football API");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedLeagueId],
  );

  useEffect(() => {
    if (isOpen) {
      setSelected(new Set());
      setSearch("");
      setImportResults(null);
      setTeams([]);
      setFiltered([]);
      setSelectedLeagueId("");
      setCurrentPage(1);
      setHasMore(false);
    }
  }, [isOpen]);

  // Auto-fetch when league changes (only if open)
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setHasMore(false);
      fetchPage(1, false);
    }
  }, [isOpen, selectedLeagueId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? teams.filter((t) => t.name.toLowerCase().includes(q)) : teams,
    );
  }, [search, teams]);

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
      setSelected(new Set(filtered.map((t) => t.apiTeamId)));
    }
  };

  const handleLoadMore = () => {
    fetchPage(currentPage + 1, true);
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    setError(null);
    let success = 0;
    let skipped = 0;

    for (const id of selected) {
      const team = teams.find((t) => t.apiTeamId === id);
      if (!team) continue;
      try {
        await apiPost("/api/admin/teams", {
          name: team.name,
          logo: team.logo || undefined,
          apiTeamId: team.apiTeamId,
          leagueId: selectedLeagueId || "",
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
    filtered.length > 0 && filtered.every((t) => selected.has(t.apiTeamId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={() => !importing && onClose()}
      />
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Import Teams from API</h2>
              <p className="text-xs text-slate-500">
                {loading
                  ? "Fetching…"
                  : totalAvailable != null
                    ? `${teams.length} of ${totalAvailable} teams loaded`
                    : `${teams.length} teams loaded`}
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
          <div className="flex gap-3">
            <select
              value={selectedLeagueId}
              onChange={(e) => {
                setSelectedLeagueId(e.target.value);
                setSelected(new Set());
              }}
              className="flex-1 px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-purple-500/50"
            >
              <option value="">All Leagues (default: Premier League)</option>
              {leagues
                .filter((l) => l.apiLeagueId != null)
                .map((l) => (
                  <option key={l.id} value={String(l.apiLeagueId)}>
                    {l.name}
                  </option>
                ))}
            </select>
            <button
              onClick={() => {
                setCurrentPage(1);
                setHasMore(false);
                fetchPage(1, false);
              }}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams…"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <button
              onClick={toggleAll}
              disabled={loading || filtered.length === 0}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors disabled:opacity-40"
            >
              {allFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-purple-400" />
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
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-sm text-slate-400">Fetching teams…</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium">{error}</p>
                <button
                  onClick={() => fetchPage(1, false)}
                  className="mt-2 flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            </div>
          )}

          {importResults && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-400">
              ✅ Imported {importResults.success} team(s)
              {importResults.skipped > 0 &&
                `, ${importResults.skipped} failed — ensure the league is imported first`}
            </div>
          )}

          {!loading &&
            !error &&
            filtered.length === 0 &&
            teams.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Select a league and click Refresh to load teams
              </div>
            )}

          {!loading && !error && filtered.length === 0 && teams.length > 0 && (
            <div className="text-center py-12 text-slate-500">
              No teams match your search
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filtered.map((team) => {
                const isSelected = selected.has(team.apiTeamId);
                return (
                  <button
                    key={team.apiTeamId}
                    onClick={() => toggleSelect(team.apiTeamId)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-purple-500/15 border-purple-500/50"
                        : "bg-slate-800/30 border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {team.logo ? (
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="w-7 h-7 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-400">
                          {team.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {team.name}
                      </p>
                      {team.country && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {team.country}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-600 flex-shrink-0">
                      #{team.apiTeamId}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Load More */}
          {!loading && !error && hasMore && !search && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 hover:border-purple-500/40 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {loadingMore
                  ? "Loading…"
                  : `Load More${totalAvailable ? ` (${totalAvailable - teams.length} remaining)` : ""}`}
              </button>
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
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 disabled:opacity-50 rounded-xl text-sm font-medium transition-all"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {importing
              ? "Importing…"
              : `Import ${selected.size > 0 ? selected.size : ""} Team${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
