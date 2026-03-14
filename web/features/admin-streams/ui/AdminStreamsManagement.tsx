"use client";

import { useEffect, useState } from "react";
import {
  getMatchesForStreams,
  upsertStream,
  type StreamMatch,
} from "../api/streamsApi";
import { cn } from "@/shared/lib/utils";
import {
  Tv,
  Plus,
  Edit2,
  Check,
  X,
  AlertCircle,
  PlayCircle,
} from "lucide-react";

interface Stream {
  id: string;
  matchId: string;
  type: "EMBED";
  provider: string | null;
  url: string | null;
  isActive: boolean;
}

export default function AdminStreamsManagement() {
  const [streamsMatches, setStreamsMatches] = useState<StreamMatch[]>([]);
  const [allMatches, setAllMatches] = useState<StreamMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMatchesList, setLoadingMatchesList] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [formData, setFormData] = useState({
    matchId: "",
    type: "EMBED" as "EMBED",
    provider: "",
    url: "",
    isActive: false,
  });

  useEffect(() => {
    loadStreamsMatches();
    loadAllSavedMatches();
  }, []);

  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showForm]);

  async function loadStreamsMatches() {
    try {
      setLoading(true);
      setError("");
      const resp = await getMatchesForStreams();
      let matchesData: StreamMatch[] = [];
      if (!resp) matchesData = [];
      else if (Array.isArray(resp)) matchesData = resp;
      else if (Array.isArray(resp.matches)) matchesData = resp.matches;
      else if (Array.isArray(resp.data)) matchesData = resp.data;
      else if (resp.data && Array.isArray(resp.data.matches))
        matchesData = resp.data.matches;

      matchesData.sort((a, b) => {
        if (a.status === b.status)
          return (
            new Date(a.kickoffTime).getTime() -
            new Date(b.kickoffTime).getTime()
          );
        if (a.status === "LIVE") return -1;
        if (b.status === "LIVE") return 1;
        if (a.status === "UPCOMING") return -1;
        if (b.status === "UPCOMING") return 1;
        return 0;
      });

      setStreamsMatches(matchesData);
    } catch (e: any) {
      setError(e?.message || "Failed to load matches");
      setStreamsMatches([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadAllSavedMatches() {
    try {
      setLoadingMatchesList(true);
      const resp = await getMatchesForStreams();
      let matchesData: StreamMatch[] = [];
      if (!resp) matchesData = [];
      else if (Array.isArray(resp)) matchesData = resp;
      else if (Array.isArray(resp.matches)) matchesData = resp.matches;
      else if (Array.isArray(resp.data)) matchesData = resp.data;
      else if (resp.data && Array.isArray(resp.data.matches))
        matchesData = resp.data.matches;

      matchesData.sort(
        (a, b) =>
          new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime(),
      );
      setAllMatches(matchesData.filter((m) => m.status !== "FINISHED"));
    } catch {
      setAllMatches([]);
    } finally {
      setLoadingMatchesList(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.matchId) {
      setError("Please select a match");
      return;
    }
    if (formData.type === "EMBED" && !formData.url) {
      setError("Please provide a stream URL or iframe");
      return;
    }
    try {
      setError("");
      setSuccessMsg("");
      await upsertStream({
        matchId: formData.matchId,
        type: formData.type,
        provider: formData.provider || null,
        url: formData.url || null,
        isActive: formData.isActive,
      });
      setSuccessMsg("✅ Stream saved successfully!");
      setShowForm(false);
      setEditingStream(null);
      resetForm();
      await Promise.all([loadStreamsMatches(), loadAllSavedMatches()]);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e: any) {
      setError(e?.message || "Failed to save stream");
    }
  }

  function resetForm() {
    setFormData({
      matchId: "",
      type: "EMBED",
      provider: "",
      url: "",
      isActive: false,
    });
  }

  function handleEdit(match: StreamMatch) {
    if (match.stream) {
      setEditingStream(match.stream as Stream);
      setFormData({
        matchId: match.id,
        type: match.stream.type,
        provider: match.stream.provider || "",
        url: match.stream.url || "",
        isActive: match.stream.isActive,
      });
    } else {
      setFormData({
        matchId: match.id,
        type: "EMBED",
        provider: "",
        url: "",
        isActive: false,
      });
    }
    if (allMatches.length === 0 && !loadingMatchesList) loadAllSavedMatches();
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingStream(null);
    resetForm();
    setError("");
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/20 text-red-400 text-xs font-bold">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold">
            UPCOMING
          </span>
        );
      case "FINISHED":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-700/50 text-slate-400 text-xs font-bold">
            FINISHED
          </span>
        );
      default:
        return null;
    }
  };

  if (loading && loadingMatchesList) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Stream Management</h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage live streams for matches
          </p>
        </div>
        <button
          onClick={() => {
            if (allMatches.length === 0 && !loadingMatchesList)
              loadAllSavedMatches();
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white font-semibold transition"
        >
          <Plus className="w-5 h-5" />
          Add Stream
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400" />
          <p className="text-sm text-green-400 font-medium">{successMsg}</p>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-400 font-medium">{error}</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700/50">
            <div className="sticky top-0 p-6 rounded-t-2xl bg-gradient-to-r from-blue-600 to-cyan-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tv className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-black text-white">
                    {editingStream ? "Edit Stream" : "Add New Stream"}
                  </h3>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 rounded hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Match *
                </label>
                <select
                  value={formData.matchId}
                  onChange={(e) =>
                    setFormData({ ...formData, matchId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 text-sm outline-none"
                  required
                >
                  <option value="">Choose a match...</option>
                  {allMatches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {match.homeTeam.name} vs {match.awayTeam.name} —{" "}
                      {new Date(match.kickoffTime).toLocaleString()} (
                      {match.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Provider
                </label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value })
                  }
                  placeholder="e.g., YouTube, Twitch"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Stream URL or iframe *
                </label>
                <textarea
                  value={formData.url}
                  onChange={(e) => {
                    let val = e.target.value;
                    const srcMatch = val.match(/src=["']([^"']+)["']/);
                    if (srcMatch) val = srcMatch[1];
                    setFormData({ ...formData, url: val });
                  }}
                  placeholder="Paste full iframe code or just the embed URL"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 text-sm outline-none resize-none"
                  required
                  rows={3}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Paste full iframe (YouTube, Twitch, Vimeo, etc.) or the embed
                  URL.
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 rounded accent-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-semibold text-slate-300 cursor-pointer"
                >
                  Stream is active and should be displayed
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-700/50 text-slate-300 hover:bg-slate-800 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition text-sm"
                >
                  {editingStream ? "Update Stream" : "Create Stream"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Streams Table */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr className="text-xs text-slate-400 uppercase tracking-wider">
              <th className="text-left px-6 py-4 font-medium">Match</th>
              <th className="text-left px-6 py-4 font-medium hidden md:table-cell">
                Date & Time
              </th>
              <th className="text-left px-6 py-4 font-medium">Status</th>
              <th className="text-left px-6 py-4 font-medium">Stream</th>
              <th className="text-left px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {streamsMatches.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <Tv className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-semibold">
                    No matches found
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Add streams to show them here
                  </p>
                </td>
              </tr>
            ) : (
              streamsMatches.map((match) => (
                <tr
                  key={match.id}
                  className={cn(
                    "border-t border-slate-700/30 hover:bg-slate-800/30 transition-colors",
                    !match.stream?.isActive ? "bg-transparent" : "",
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-sm text-white">
                      {match.homeTeam.name} vs {match.awayTeam.name}
                    </div>
                    {match.league?.name && (
                      <div className="text-xs text-slate-500">
                        {match.league.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 hidden md:table-cell">
                    {new Date(match.kickoffTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(match.status)}</td>
                  <td className="px-6 py-4">
                    {match.stream ? (
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-blue-400" />
                        {match.stream.provider && (
                          <span className="text-xs text-slate-400">
                            {match.stream.provider}
                          </span>
                        )}
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${
                            match.stream.isActive
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-slate-700/50 text-slate-500 border-slate-600/30"
                          }`}
                        >
                          {match.stream.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500">No stream</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(match)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700/50 hover:border-blue-500/50 text-blue-400 text-sm font-semibold transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      {match.stream ? "Edit" : "Add"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
