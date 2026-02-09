"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/components/api";
import {
  Tv,
  Plus,
  Edit2,
  Check,
  X,
  AlertCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stream {
  id: string;
  matchId: string;
  type: "EMBED";
  provider: string | null;
  url: string | null;
  isActive: boolean;
}

interface TeamRef {
  id?: string;
  name: string;
  logo?: string | null;
}

interface Match {
  id: string;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  kickoffTime: string;
  status: string;
  stream?: Stream | null;
  league?: { id?: string; name?: string };
}

export default function AdminStreamsManagement() {
  const [streamsMatches, setStreamsMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
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
    // prevent background scroll when modal is open
    document.body.style.overflow = showForm ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto"; // restore on unmount
    };
  }, [showForm]);

  async function loadStreamsMatches() {
    try {
      setLoading(true);
      setError("");
      const resp = await apiGet<any>("/api/admin/streams");
      let matchesData: Match[] = [];
      if (!resp) matchesData = [];
      else if (Array.isArray(resp)) matchesData = resp;
      else if (Array.isArray(resp.matches)) matchesData = resp.matches;
      else if (Array.isArray(resp.data)) matchesData = resp.data;
      else if (resp.data && Array.isArray(resp.data.matches))
        matchesData = resp.data.matches;
      else matchesData = [];

      // sort: LIVE first, UPCOMING next
      matchesData.sort((a, b) => {
        if (a.status === b.status) {
          return (
            new Date(a.kickoffTime).getTime() -
            new Date(b.kickoffTime).getTime()
          );
        }
        if (a.status === "LIVE") return -1;
        if (b.status === "LIVE") return 1;
        if (a.status === "UPCOMING") return -1;
        if (b.status === "UPCOMING") return 1;
        return 0;
      });

      setStreamsMatches(matchesData);
    } catch (e: any) {
      console.error("Error loading streams matches:", e);
      setError(e?.message || "Failed to load matches");
      setStreamsMatches([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadAllSavedMatches() {
    try {
      setLoadingMatchesList(true);
      const resp = await apiGet<any>("/api/admin/matches/saved");
      let matchesData: Match[] = [];
      if (!resp) matchesData = [];
      else if (Array.isArray(resp)) matchesData = resp;
      else if (Array.isArray(resp.matches)) matchesData = resp.matches;
      else if (Array.isArray(resp.data)) matchesData = resp.data;
      else if (resp.data && Array.isArray(resp.data.matches))
        matchesData = resp.data.matches;
      else matchesData = [];

      matchesData.sort(
        (a, b) =>
          new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime(),
      );

      // only UPCOMING or LIVE matches
      setAllMatches(matchesData.filter((m) => m.status !== "FINISHED"));
    } catch (e: any) {
      console.error("Error loading saved matches:", e);
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

      await apiPost("/api/admin/stream", {
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
      console.error("Error saving stream:", e);
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

  function handleEdit(match: Match) {
    if (match.stream) {
      setEditingStream(match.stream);
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
    if (allMatches.length === 0 && !loadingMatchesList) {
      loadAllSavedMatches();
    }
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
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
            UPCOMING
          </span>
        );
      case "FINISHED":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-bold">
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
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">
            Stream Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
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
          className="flex items-center gap-2 bg-gradient-to-r from-accent to-primary px-4 py-2 rounded-lg text-primary-foreground font-semibold shadow-sm hover:opacity-95 transition"
        >
          <Plus className="w-5 h-5" />
          Add Stream
        </button>
      </div>

      {/* Success & Error */}
      {successMsg && (
        <div className="p-4 rounded-lg border border-accent/30 bg-accent/10 flex items-center gap-3">
          <Check className="w-5 h-5 text-accent" />
          <p className="text-sm text-foreground font-medium">{successMsg}</p>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-sm text-foreground font-medium">{error}</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ backgroundColor: "var(--card)" }}
          >
            <div
              className="sticky top-0 p-6 rounded-t-2xl"
              style={{
                background:
                  "linear-gradient(90deg,var(--accent),var(--primary))",
                color: "var(--primary-foreground)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tv className="w-6 h-6" />
                  <h3 className="text-xl font-black">
                    {editingStream ? "Edit Stream" : "Add New Stream"}
                  </h3>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 rounded hover:bg-white/5 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Match Selection */}
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-2">
                  Select Match *
                </label>
                <select
                  value={formData.matchId}
                  onChange={(e) =>
                    setFormData({ ...formData, matchId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground"
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

              {/* Provider & URL */}
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-2">
                  Provider
                </label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value })
                  }
                  placeholder="e.g., YouTube, Twitch"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-2">
                  Stream URL or iframe *
                </label>
                <textarea
                  value={formData.url}
                  onChange={(e) => {
                    let val = e.target.value;
                    // extract src if iframe is pasted
                    const srcMatch = val.match(/src=["']([^"']+)["']/);
                    if (srcMatch) val = srcMatch[1];
                    setFormData({ ...formData, url: val });
                  }}
                  placeholder="Paste full iframe code or just the embed URL"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground"
                  required
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Paste full iframe (YouTube, Twitch, Vimeo, etc.) or the embed
                  URL.
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-border text-accent"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-semibold text-foreground"
                >
                  Stream is active and should be displayed
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 rounded-lg border border-border text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-accent to-primary text-primary-foreground font-semibold"
                >
                  {editingStream ? "Update Stream" : "Create Stream"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Streams Table */}
      <div
        className="rounded-2xl border border-border overflow-hidden"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Match
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Stream
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: "var(--sidebar-border)" }}
            >
              {streamsMatches.map((match) => (
                <tr
                  key={match.id}
                  className={cn(
                    "hover:bg-muted/10 transition-colors",
                    !match.stream?.isActive ? "bg-background" : "",
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">
                      {match.homeTeam.name} vs {match.awayTeam.name}
                    </div>
                    {match.league?.name && (
                      <div className="text-xs text-muted-foreground">
                        {match.league.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground">
                      {new Date(match.kickoffTime).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(match.status)}</td>
                  <td className="px-6 py-4">
                    {match.stream ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="w-4 h-4 text-accent" />
                          {match.stream.provider && (
                            <div className="text-xs text-muted-foreground">
                              {match.stream.provider}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No stream
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(match)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-accent text-sm font-semibold"
                    >
                      <Edit2 className="w-4 h-4" />{" "}
                      {match.stream ? "Edit" : "Add"}
                    </button>
                  </td>
                </tr>
              ))}
              {streamsMatches.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-foreground">
                    <Tv className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-semibold">
                      No matches with active streams
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add streams to show them here
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
