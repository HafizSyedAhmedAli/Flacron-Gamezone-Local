"use client";

import { useState } from "react";
import { Search, Edit2, Trash2, RefreshCw, Youtube, Zap } from "lucide-react";
import type { AdminStream } from "../api/streamsApi";

interface StreamBrowserProps {
  streams: AdminStream[];
  onEdit: (stream: AdminStream) => void;
  onDelete: (stream: AdminStream) => void;
  onYoutubeSearch: (stream: AdminStream) => void;
  onBulkSearch: () => void;
  bulkSearching: boolean;
}

export function StreamBrowser({
  streams,
  onEdit,
  onDelete,
  onYoutubeSearch,
  onBulkSearch,
  bulkSearching,
}: StreamBrowserProps) {
  const [search, setSearch] = useState("");

  const filtered = streams.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.match?.homeTeam.name ?? "").toLowerCase().includes(q) ||
      (s.match?.awayTeam.name ?? "").toLowerCase().includes(q) ||
      (s.streamTitle ?? "").toLowerCase().includes(q)
    );
  });

  const matchName = (s: AdminStream) =>
    s.match
      ? `${s.match.homeTeam.name} vs ${s.match.awayTeam.name}`
      : (s.matchId ?? "—");

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search streams…"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <button
          onClick={onBulkSearch}
          disabled={bulkSearching}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 hover:border-yellow-500/50 rounded-xl text-sm transition-all disabled:opacity-50"
        >
          <Zap
            className={`w-4 h-4 text-yellow-400 ${bulkSearching ? "animate-spin" : ""}`}
          />{" "}
          Bulk YouTube Search
        </button>
      </div>
      <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr className="text-xs text-slate-400 uppercase tracking-wider">
              <th className="text-left px-4 py-3">Match</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">
                Provider
              </th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-slate-500">
                  No streams found
                </td>
              </tr>
            ) : (
              filtered.map((stream, i) => (
                <tr
                  key={stream.id ?? i}
                  className="border-t border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">
                      {matchName(stream)}
                    </div>
                    {stream.streamTitle && (
                      <div className="text-xs text-slate-500 mt-0.5 truncate max-w-48">
                        {stream.streamTitle}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400 hidden md:table-cell">
                    {stream.provider === "youtube" ? (
                      <span className="flex items-center gap-1">
                        <Youtube className="w-3 h-3 text-red-400" />
                        YouTube
                      </span>
                    ) : (
                      (stream.provider ?? "—")
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border ${stream.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-slate-700/50 text-slate-400 border-slate-600/30"}`}
                    >
                      {stream.type === "NONE"
                        ? "No Stream"
                        : stream.isActive
                          ? "Active"
                          : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onYoutubeSearch(stream)}
                        className="p-1.5 hover:bg-slate-700 rounded-lg"
                        title="YouTube Search"
                      >
                        <Youtube className="w-3.5 h-3.5 text-red-400" />
                      </button>
                      <button
                        onClick={() => onEdit(stream)}
                        className="p-1.5 hover:bg-slate-700 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                      <button
                        onClick={() => onDelete(stream)}
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
      <p className="text-xs text-slate-500 text-right">
        {filtered.length} of {streams.length} streams
      </p>
    </div>
  );
}
