"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Search,
  Download,
  Globe,
  Loader2,
  CheckSquare,
  Square,
  AlertCircle,
  RefreshCw,
  Trophy,
} from "lucide-react";
import { apiGet, apiPost } from "@/shared/api/base";

interface ApiLeague {
  apiLeagueId: number;
  name: string;
  logo: string | null;
  country: string;
}

interface LeagueApiBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

export function LeagueApiBrowser({
  isOpen,
  onClose,
  onImported,
}: LeagueApiBrowserProps) {
  const [leagues, setLeagues] = useState<ApiLeague[]>([]);
  const [filtered, setFiltered] = useState<ApiLeague[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importResults, setImportResults] = useState<{
    success: number;
    skipped: number;
  } | null>(null);

  const fetchLeagues = useCallback(async () => {
    setLoading(true);
    setError(null);
    setImportResults(null);
    try {
      const data = await apiGet<{
        success: boolean;
        data: ApiLeague[];
        pagination: unknown;
      }>("/api/admin/leagues/api?page=1&limit=500");
      const items = data.data ?? [];
      setLeagues(items);
      setFiltered(items);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch leagues from Football API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelected(new Set());
      setSearch("");
      setImportResults(null);
      fetchLeagues();
    }
  }, [isOpen, fetchLeagues]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? leagues.filter(
            (l) =>
              l.name.toLowerCase().includes(q) ||
              (l.country ?? "").toLowerCase().includes(q),
          )
        : leagues,
    );
  }, [search, leagues]);

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
      setSelected(new Set(filtered.map((l) => l.apiLeagueId)));
    }
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    setError(null);
    let success = 0;
    let skipped = 0;

    for (const id of selected) {
      const league = leagues.find((l) => l.apiLeagueId === id);
      if (!league) continue;
      try {
        await apiPost("/api/admin/leagues", {
          name: league.name,
          country: league.country || undefined,
          logo: league.logo || undefined,
          apiLeagueId: league.apiLeagueId,
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
    filtered.length > 0 && filtered.every((l) => selected.has(l.apiLeagueId));

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
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Import Leagues from API</h2>
              <p className="text-xs text-slate-500">
                {leagues.length > 0
                  ? `${leagues.length} leagues available`
                  : "Fetching from Football API…"}
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

        {/* Search + controls */}
        <div className="p-4 border-b border-slate-700/30 flex-shrink-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or country…"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <button
              onClick={toggleAll}
              disabled={loading || filtered.length === 0}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors disabled:opacity-40"
            >
              {allFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-400" />
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
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-sm text-slate-400">
                Fetching from Football API…
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium">{error}</p>
                <button
                  onClick={fetchLeagues}
                  className="mt-2 flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            </div>
          )}

          {importResults && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-400">
              ✅ Imported {importResults.success} league(s)
              {importResults.skipped > 0 &&
                `, ${importResults.skipped} already existed`}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No leagues found
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filtered.map((league) => {
                const isSelected = selected.has(league.apiLeagueId);
                return (
                  <button
                    key={league.apiLeagueId}
                    onClick={() => toggleSelect(league.apiLeagueId)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-blue-500/15 border-blue-500/50"
                        : "bg-slate-800/30 border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {league.logo ? (
                        <img
                          src={league.logo}
                          alt={league.name}
                          className="w-7 h-7 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <Globe className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {league.name}
                      </p>
                      {league.country && (
                        <p className="text-xs text-slate-500 truncate">
                          {league.country}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-600 flex-shrink-0">
                      #{league.apiLeagueId}
                    </span>
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
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 disabled:opacity-50 rounded-xl text-sm font-medium transition-all"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {importing
              ? "Importing…"
              : `Import ${selected.size > 0 ? selected.size : ""} League${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
