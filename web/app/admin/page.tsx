"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  getToken,
} from "../../components/api";
import { Shell } from "@/components/layout";

export interface LeaguesResponse {
  success: boolean;
  leagues: Array<{
    apiLeagueId: number;
    name: string;
    logo: string;
    country: string;
  }>;
}

export default function AdminPage() {
  const [tab, setTab] = useState<"leagues" | "teams" | "matches" | "users">(
    "leagues"
  );
  const [leagues, setLeagues] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // League browser states
  const [showBrowser, setShowBrowser] = useState(false);
  const [apiLeagues, setApiLeagues] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [browsing, setBrowsing] = useState(false);

  // Edit / Delete UI state (new)
  const [editingLeague, setEditingLeague] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingLeague, setSavingLeague] = useState(false);

  const [leagueToDelete, setLeagueToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // if (!getToken()) { location.href = "/login"; return; }
    refreshAll();
  }, []);

  async function refreshAll() {
    setLoading(true);
    try {
      const [l, t, m] = await Promise.all([
        apiGet<any[]>("/api/admin/leagues/saved"),
        apiGet<any[]>("/api/teams"),
        apiGet<any[]>("/api/matches"),
      ]);
      setLeagues(l || []);
      setTeams(t || []);
      setMatches(m || []);
      try {
        const u = await apiGet<any[]>("/api/admin/users");
        setUsers(u || []);
      } catch {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setMsg("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function browseApiLeagues() {
    setBrowsing(true);
    try {
      const response = await apiGet<LeaguesResponse>("/api/admin/leagues");
      setApiLeagues(response.leagues || []);
      setShowBrowser(true);
    } catch (err) {
      console.error(err);
      setMsg("Failed to load leagues from API");
    } finally {
      setBrowsing(false);
    }
  }

  async function addLeagueFromApi(league: any) {
    try {
      await apiPost("/api/admin/league", {
        apiLeagueId: league.apiLeagueId,
        name: league.name,
        country: league.country,
        logo: league.logo,
      });
      setMsg(`Added ${league.name} to your leagues`);
      refreshAll();
    } catch (err) {
      console.error(err);
      setMsg("Failed to add league");
    }
  }

  async function createTeam() {
    const name = prompt("Team name?");
    if (!name) return;
    const leagueId = leagues[0]?.id || null;
    await apiPost("/api/admin/team", { name, leagueId, logo: "" });
    setMsg("Team created");
    refreshAll();
  }

  async function createMatch() {
    if (teams.length < 2) {
      alert("Create at least 2 teams first.");
      return;
    }
    const homeTeamId = teams[0].id;
    const awayTeamId = teams[1].id;
    const kickoffTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    await apiPost("/api/admin/match", {
      homeTeamId,
      awayTeamId,
      kickoffTime,
      status: "UPCOMING",
      score: "0-0",
      venue: "",
    });
    setMsg("Match created");
    refreshAll();
  }

  async function setMatchStatus(id: string | number, status: string) {
    await apiPut(`/api/admin/match/${id}`, { status });
    setMsg("Match updated");
    refreshAll();
  }

  async function deleteResource(url: string) {
    if (!confirm("Confirm delete?")) return;
    await apiDelete(url);
    setMsg("Deleted");
    refreshAll();
  }

  // ---------- New: League update & delete APIs (UI) ----------
  async function openEditModal(league: any) {
    setEditingLeague({
      id: league.id,
      name: league.name || "",
      country: league.country || "",
      logo: league.logo || "",
    });
    setShowEditModal(true);
  }

  async function saveEditingLeague() {
    if (!editingLeague) return;
    setSavingLeague(true);
    try {
      const payload = {
        name: editingLeague.name,
        country: editingLeague.country,
        logo: editingLeague.logo === "" ? "" : editingLeague.logo, // backend converts "" -> null
      };
      await apiPut(`/api/admin/league/${editingLeague.id}`, payload);
      setMsg("League saved");
      setShowEditModal(false);
      setEditingLeague(null);
      refreshAll();
    } catch (err) {
      console.error(err);
      setMsg("Failed to save league");
    } finally {
      setSavingLeague(false);
    }
  }

  function openDeleteConfirm(league: any) {
    setLeagueToDelete(league);
    setShowDeleteConfirm(true);
  }

  async function confirmDeleteLeague() {
    if (!leagueToDelete) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/admin/league/${leagueToDelete.id}`);
      setMsg("League deleted");
      setShowDeleteConfirm(false);
      setLeagueToDelete(null);
      refreshAll();
    } catch (err) {
      console.error(err);
      setMsg("Failed to delete league");
    } finally {
      setDeleting(false);
    }
  }

  const filteredApiLeagues = apiLeagues.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabButtonClass = (isActive: boolean) =>
    `items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 hidden sm:inline-flex ${
      isActive ? "bg-accent dark:bg-accent/50 text-white" : ""
    }`;

  return (
    <Shell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage matches, teams, and leagues
          </p>
        </div>

        {msg && (
          <div className="text-sm bg-green-500/10 text-green-500 p-3 rounded-lg">
            {msg}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 flex-wrap">
          <Button onClick={createMatch} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Match
          </Button>
          <Button onClick={createTeam} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Team
          </Button>
          <Button
            onClick={browseApiLeagues}
            className="gap-2"
            disabled={browsing}
          >
            <Search className="w-4 h-4" />
            {browsing ? "Loading..." : "Browse Leagues"}
          </Button>
        </div>

        {/* League Browser Modal */}
        {showBrowser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">
                    Browse Leagues from API
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBrowser(false)}
                  >
                    Close
                  </Button>
                </div>
                <input
                  type="text"
                  placeholder="Search leagues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                />
              </div>
              <div className="overflow-y-auto p-6 space-y-3">
                {filteredApiLeagues.map((league) => {
                  const alreadyAdded = leagues.some(
                    (l) => l.apiLeagueId === league.apiLeagueId
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
                        onClick={() => addLeagueFromApi(league)}
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
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab selector */}
        <div className="flex gap-2 mt-4">
          {(["leagues", "teams", "matches", "users"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={tabButtonClass(tab === t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : (
          <>
            {tab === "matches" && (
              <div className="bg-card border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Recent Matches</h2>
                <div className="space-y-3">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg"
                    >
                      <div>
                        <div className="font-semibold">
                          {m.homeTeam?.name || "—"} vs {m.awayTeam?.name || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(m.kickoffTime).toLocaleString()} •{" "}
                          {m.status} • Score: {m.score}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            const score = prompt("New score?", m.score);
                            if (score)
                              apiPut(`/api/admin/match/${m.id}`, {
                                score,
                              }).then(refreshAll);
                          }}
                        >
                          <Edit className="w-4 h-4" /> EDIT
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            deleteResource(`/api/admin/match/${m.id}`)
                          }
                        >
                          <Trash2 className="w-4 h-4" /> DELETE
                        </Button>
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => setMatchStatus(m.id, "LIVE")}
                        >
                          Set LIVE
                        </Button>
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => setMatchStatus(m.id, "FINISHED")}
                        >
                          Set FINISHED
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------- LEAGUES TAB (updated UI) -------------------- */}
            {tab === "leagues" && (
              <div className="space-y-3">
                {leagues.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p className="mb-4">No leagues added yet</p>
                    <Button onClick={browseApiLeagues} className="gap-2">
                      <Search className="w-4 h-4" />
                      Browse & Add Leagues
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {leagues.map((l) => (
                      <div
                        key={l.id}
                        className="bg-card border border-slate-700/50 rounded-lg p-4 flex flex-col"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {l.logo ? (
                              <img
                                src={l.logo}
                                alt={l.name}
                                className="w-16 h-16 object-contain rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded bg-slate-800 flex items-center justify-center text-sm text-slate-400">
                                No logo
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="font-semibold text-lg">
                              {l.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {l.country || "—"}
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(l)}
                                className="gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openDeleteConfirm(l)}
                                className="gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "teams" && (
              <div className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  {teams.map((tn) => (
                    <div
                      key={tn.id}
                      className="bg-card border border-slate-700/50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold">{tn.name}</div>
                        <div className="text-sm text-slate-500">
                          {tn.league?.name || "—"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const name = prompt("New name", tn.name);
                            if (name)
                              apiPut(`/api/admin/team/${tn.id}`, { name }).then(
                                refreshAll
                              );
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            deleteResource(`/api/admin/team/${tn.id}`)
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "users" && (
              <div className="space-y-3">
                {users.length === 0 ? (
                  <div className="text-slate-600 text-sm">
                    If this is empty, you are not ADMIN or backend blocked the
                    request.
                  </div>
                ) : (
                  users.map((u) => (
                    <div key={u.id} className="rounded-2xl border p-4">
                      <div className="font-semibold">{u.email}</div>
                      <div className="text-sm text-slate-600">
                        Role: {u.role} • Sub: {u.subscription?.status || "—"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Summary cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card border border-slate-700/50 rounded-lg p-6">
            <div className="text-muted-foreground text-sm mb-2">
              Total Matches
            </div>
            <div className="text-3xl font-bold">{matches.length}</div>
          </div>
          <div className="bg-card border border-slate-700/50 rounded-lg p-6">
            <div className="text-muted-foreground text-sm mb-2">
              Total Teams
            </div>
            <div className="text-3xl font-bold">{teams.length}</div>
          </div>
          <div className="bg-card border border-slate-700/50 rounded-lg p-6">
            <div className="text-muted-foreground text-sm mb-2">
              Total Leagues
            </div>
            <div className="text-3xl font-bold">{leagues.length}</div>
          </div>
        </div>
      </div>

      {/* -------------------- Edit Modal -------------------- */}
      {showEditModal && editingLeague && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              if (!savingLeague) {
                setShowEditModal(false);
                setEditingLeague(null);
              }
            }}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 z-10">
            <h3 className="text-xl font-semibold mb-4">Edit League</h3>

            <label className="block text-sm mb-2">Name</label>
            <input
              className="w-full px-3 py-2 mb-3 rounded bg-slate-800 border border-slate-700"
              value={editingLeague.name}
              onChange={(e) =>
                setEditingLeague((s: any) => ({ ...s, name: e.target.value }))
              }
            />

            <label className="block text-sm mb-2">Country</label>
            <input
              className="w-full px-3 py-2 mb-3 rounded bg-slate-800 border border-slate-700"
              value={editingLeague.country}
              onChange={(e) =>
                setEditingLeague((s: any) => ({
                  ...s,
                  country: e.target.value,
                }))
              }
            />

            <label className="block text-sm mb-2">Logo URL</label>
            <input
              className="w-full px-3 py-2 mb-2 rounded bg-slate-800 border border-slate-700"
              value={editingLeague.logo}
              onChange={(e) =>
                setEditingLeague((s: any) => ({ ...s, logo: e.target.value }))
              }
            />

            {editingLeague.logo && (
              <div className="mb-3">
                <div className="text-sm mb-1">Preview</div>
                {/* simple img with onError fallback */}
                <img
                  src={editingLeague.logo}
                  alt="logo preview"
                  className="w-32 h-16 object-contain rounded bg-white/5 border border-slate-700"
                  onError={(e) => {
                    // hide broken image preview
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (!savingLeague) {
                    setShowEditModal(false);
                    setEditingLeague(null);
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={saveEditingLeague}
                disabled={savingLeague || editingLeague.name.trim() === ""}
              >
                {savingLeague ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- Delete Confirm -------------------- */}
      {showDeleteConfirm && leagueToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              if (!deleting) {
                setShowDeleteConfirm(false);
                setLeagueToDelete(null);
              }
            }}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 z-10">
            <h3 className="text-lg font-semibold mb-2">Confirm delete</h3>
            <p className="text-sm text-slate-400">
              Are you sure you want to delete{" "}
              <strong>{leagueToDelete.name}</strong>? This action cannot be
              undone.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (!deleting) {
                    setShowDeleteConfirm(false);
                    setLeagueToDelete(null);
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteLeague}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
