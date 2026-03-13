"use client";

import { useState, useCallback, useEffect } from "react";
import { Shield } from "lucide-react";

// Entities
import type { League } from "@/entities/league/model/types";
import type { Team } from "@/entities/team/model/types";

// Features
import { useRequireAdmin } from "@/features/auth/hooks/useAuth";
import { AlertMessage } from "@/shared/ui/AlertMessage";
import { DeleteConfirmModal } from "@/shared/ui/DeleteConfirmModal";
import { LoadingState, ErrorState } from "@/shared/ui/LoadingErrorStates";

// Admin features
import {
  getLeagues,
  createLeague,
  updateLeague,
  deleteLeague,
  syncLeague,
  bulkSyncLeagues,
} from "@/features/admin-leagues/api/leaguesApi";
import { LeagueBrowser } from "@/features/admin-leagues/ui/LeagueBrowser";
import { LeagueEditModal } from "@/features/admin-leagues/ui/LeagueEditModal";

import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from "@/features/admin-teams/api/teamsApi";
import { TeamBrowser } from "@/features/admin-teams/ui/TeamBrowser";
import { TeamEditModal } from "@/features/admin-teams/ui/TeamEditModal";

import {
  getAdminMatches,
  createMatch,
  updateMatch,
  deleteMatch,
  syncLiveMatches,
  generateMatchAISummary,
  type AdminMatch,
} from "@/features/admin-matches/api/matchesApi";
import { MatchBrowser } from "@/features/admin-matches/ui/MatchBrowser";
import { MatchEditModal } from "@/features/admin-matches/ui/MatchEditModal";

import {
  getStreams,
  updateStream,
  deleteStream,
  triggerYoutubeSearch,
  triggerBulkYoutubeSearch,
  type AdminStream,
} from "@/features/admin-streams/api/streamsApi";
import { StreamBrowser } from "@/features/admin-streams/ui/StreamBrowser";
import { StreamEditModal } from "@/features/admin-streams/ui/StreamEditModal";

import {
  getUsers,
  updateUser,
  deleteUser,
  cancelUserSubscription,
  type AdminUser,
} from "@/features/admin-users/api/usersApi";
import { UserBrowser } from "@/features/admin-users/ui/UserBrowser";
import { UserEditModal } from "@/features/admin-users/ui/UserEditModal";

// Widgets
import { StatsCards } from "@/widgets/stats-cards/ui/StatsCards";
import {
  AdminPanelTabs,
  type AdminTab,
} from "@/widgets/admin-panel/ui/AdminPanelTabs";

interface Message {
  text: string;
  type: "success" | "error" | "info";
}

export function AdminPanel() {
  const { isChecking } = useRequireAdmin();

  // --- global state ---
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // --- data ---
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [streams, setStreams] = useState<AdminStream[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  // --- pagination / filter ---
  const [matchPage, setMatchPage] = useState(0);
  const [matchStatusFilter, setMatchStatusFilter] = useState("");
  const [matchLeagueFilter, setMatchLeagueFilter] = useState("");
  const [userPage, setUserPage] = useState(0);
  const [userSearch, setUserSearch] = useState("");

  // --- modal state ---
  const [editLeague, setEditLeague] = useState<League | null>(null);
  const [leagueModalOpen, setLeagueModalOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editMatch, setEditMatch] = useState<AdminMatch | null>(null);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [editStream, setEditStream] = useState<AdminStream | null>(null);
  const [streamModalOpen, setStreamModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

  // --- delete confirm ---
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  // --- syncing ---
  const [syncingLeague, setSyncingLeague] = useState<string | null>(null);
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [syncingMatches, setSyncingMatches] = useState(false);
  const [bulkYoutubeSearching, setBulkYoutubeSearching] = useState(false);

  const showMessage = (text: string, type: Message["type"] = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // --------------- data loaders ---------------
  const loadLeagues = useCallback(async () => {
    try {
      setLeagues(await getLeagues());
    } catch {}
  }, []);

  const loadTeams = useCallback(async () => {
    try {
      setTeams(await getTeams());
    } catch {}
  }, []);

  const loadMatches = useCallback(async () => {
    try {
      const data = await getAdminMatches(
        matchPage,
        10,
        matchStatusFilter || undefined,
        matchLeagueFilter || undefined,
      );
      setMatches(data.matches);
      setTotalMatches(data.total);
    } catch {}
  }, [matchPage, matchStatusFilter, matchLeagueFilter]);

  const loadStreams = useCallback(async () => {
    try {
      setStreams(await getStreams());
    } catch {}
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsers(userPage, 10, userSearch || undefined);
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch {}
  }, [userPage, userSearch]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadLeagues(),
        loadTeams(),
        loadMatches(),
        loadStreams(),
        loadUsers(),
      ]);
    } catch (e) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [loadLeagues, loadTeams, loadMatches, loadStreams, loadUsers]);

  useEffect(() => {
    if (!isChecking) loadAll();
  }, [isChecking, loadAll]);
  useEffect(() => {
    if (!isChecking && activeTab === "matches") loadMatches();
  }, [matchPage, matchStatusFilter, matchLeagueFilter]);
  useEffect(() => {
    if (!isChecking && activeTab === "users") loadUsers();
  }, [userPage, userSearch]);

  // --------------- league handlers ---------------
  const handleLeagueSave = async (form: {
    name: string;
    country: string;
    logo: string;
    apiLeagueId: string;
  }) => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        country: form.country || undefined,
        logo: form.logo || undefined,
        apiLeagueId: form.apiLeagueId ? Number(form.apiLeagueId) : undefined,
      };
      if (editLeague) await updateLeague(editLeague.id, payload);
      else await createLeague(payload);
      showMessage(editLeague ? "League updated" : "League created");
      setLeagueModalOpen(false);
      await loadLeagues();
    } catch (e: any) {
      showMessage(e.message, "error");
    }
    setSaving(false);
  };

  const handleLeagueDelete = (league: League) => {
    setDeleteModal({
      open: true,
      title: "Delete League",
      message: `Delete "${league.name}"? This cannot be undone.`,
      onConfirm: async () => {
        setDeleting(true);
        try {
          await deleteLeague(league.id);
          showMessage("League deleted");
          await loadLeagues();
        } catch (e: any) {
          showMessage(e.message, "error");
        }
        setDeleting(false);
        setDeleteModal((d) => ({ ...d, open: false }));
      },
    });
  };

  const handleLeagueSync = async (id: string) => {
    setSyncingLeague(id);
    try {
      await syncLeague(id);
      showMessage("League synced");
      await loadLeagues();
    } catch (e: any) {
      showMessage(e.message, "error");
    }
    setSyncingLeague(null);
  };

  const handleBulkSync = async () => {
    setBulkSyncing(true);
    try {
      await bulkSyncLeagues();
      showMessage("All leagues synced");
      await Promise.all([loadLeagues(), loadTeams(), loadMatches()]);
    } catch (e: any) {
      showMessage(e.message, "error");
    }
    setBulkSyncing(false);
  };

  // --------------- team handlers ---------------
  const handleTeamSave = async (form: {
    name: string;
    leagueId: string;
    logo: string;
    apiTeamId: string;
  }) => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        leagueId: form.leagueId || undefined,
        logo: form.logo || undefined,
        apiTeamId: form.apiTeamId ? Number(form.apiTeamId) : undefined,
      };
      if (editTeam) await updateTeam(editTeam.id, payload);
      else await createTeam(payload);
      showMessage(editTeam ? "Team updated" : "Team created");
      setTeamModalOpen(false);
      await loadTeams();
    } catch (e: any) {
      showMessage(e.message, "error");
    }
    setSaving(false);
  };

  const handleTeamDelete = (team: Team) => {
    setDeleteModal({
      open: true,
      title: "Delete Team",
      message: `Delete "${team.name}"?`,
      onConfirm: async () => {
        setDeleting(true);
        try {
          await deleteTeam(team.id);
          showMessage("Team deleted");
          await loadTeams();
        } catch (e: any) {
          showMessage(e.message, "error");
        }
        setDeleting(false);
        setDeleteModal((d) => ({ ...d, open: false }));
      },
    });
  };

  // --------------- match handlers ---------------
  const handleMatchSave = async (form: {
    homeTeamId: string;
    awayTeamId: string;
    leagueId: string;
    kickoffTime: string;
    venue: string;
    status: string;
    score: string;
  }) => {
    setSaving(true);
    try {
      const payload = {
        homeTeamId: form.homeTeamId,
        awayTeamId: form.awayTeamId,
        leagueId: form.leagueId || undefined,
        kickoffTime: form.kickoffTime,
        venue: form.venue || undefined,
        status: form.status,
        score: form.score || undefined,
      };
      if (editMatch) await updateMatch(editMatch.id, payload);
      else await createMatch(payload as any);
      showMessage(editMatch ? "Match updated" : "Match created");
      setMatchModalOpen(false);
      await loadMatches();
    } catch (e: any) {
      showMessage(e.message, "error");
    }
    setSaving(false);
  };

  const handleMatchDelete = (match: AdminMatch) => {
    setDeleteModal({
      open: true,
      title: "Delete Match",
      message: `Delete "${match.homeTeam.name} vs ${match.awayTeam.name}"?`,
      onConfirm: async () => {
        setDeleting(true);
        try {
          await deleteMatch(match.id);
          showMessage("Match deleted");
          await loadMatches();
        } catch (e: any) {
          showMessage(e.message, "error");
        }
        setDeleting(false);
        setDeleteModal((d) => ({ ...d, open: false }));
      },
    });
  };

  const handleSyncLiveMatches = async () => {
    setSyncingMatches(true);
    try {
      await syncLiveMatches();
      showMessage("Live matches synced");
      await loadMatches();
    } catch (e: any) {
      showMessage(e.message, "error");
    }
    setSyncingMatches(false);
  };

  const handleGenerateAI = async (id: string) => {
    try {
      await generateMatchAISummary(id);
      showMessage("AI summary generated");
    } catch (e: any) {
      showMessage(e.message, "error");
    }
  };

  // --------------- stream handlers ---------------
  const handleStreamSave = async (form: {
    type: "EMBED" | "NONE";
    provider: string;
    url: string;
    isActive: boolean;
  }) => {
    if (!editStream?.matchId) return;
    setSaving(true);
    try {
      await updateStream(editStream.matchId, {
        type: form.type,
        provider: form.provider || undefined,
        url: form.url || undefined,
        isActive: form.isActive,
      });
      showMessage("Stream updated");
      setStreamModalOpen(false);
      await loadStreams();
    } catch (e: any) {
      showMessage(e.message, "error");
    }
    setSaving(false);
  };

  const handleStreamDelete = (stream: AdminStream) => {
    if (!stream.matchId) return;
    setDeleteModal({
      open: true,
      title: "Delete Stream",
      message: "Delete this stream configuration?",
      onConfirm: async () => {
        setDeleting(true);
        try {
          await deleteStream(stream.matchId!);
          showMessage("Stream deleted");
          await loadStreams();
        } catch (e: any) {
          showMessage(e.message, "error");
        }
        setDeleting(false);
        setDeleteModal((d) => ({ ...d, open: false }));
      },
    });
  };

  const handleYoutubeSearch = async (stream: AdminStream) => {
    if (!stream.matchId) return;
    try {
      const r = await triggerYoutubeSearch(stream.matchId);
      showMessage(
        r.found ? "Stream found on YouTube!" : "No stream found on YouTube",
        r.found ? "success" : "info",
      );
      await loadStreams();
    } catch (e: any) {
      showMessage(e.message, "error");
    }
  };

  const handleBulkYoutubeSearch = async () => {
    setBulkYoutubeSearching(true);
    try {
      const r = await triggerBulkYoutubeSearch();
      showMessage(`Searched ${r.searched} matches`);
      await loadStreams();
    } catch (e: any) {
      showMessage(e.message, "error");
    }
    setBulkYoutubeSearching(false);
  };

  // --------------- user handlers ---------------
  const handleUserSave = async (role: string) => {
    if (!editUser) return;
    setSaving(true);
    try {
      await updateUser(String(editUser.id), { role });
      showMessage("User updated");
      setUserModalOpen(false);
      await loadUsers();
    } catch (e: any) {
      showMessage(e.message, "error");
    }
    setSaving(false);
  };

  const handleUserDelete = (user: AdminUser) => {
    setDeleteModal({
      open: true,
      title: "Delete User",
      message: `Delete user "${user.email}"? This cannot be undone.`,
      onConfirm: async () => {
        setDeleting(true);
        try {
          await deleteUser(String(user.id));
          showMessage("User deleted");
          await loadUsers();
        } catch (e: any) {
          showMessage(e.message, "error");
        }
        setDeleting(false);
        setDeleteModal((d) => ({ ...d, open: false }));
      },
    });
  };

  const handleCancelSubscription = (user: AdminUser) => {
    setDeleteModal({
      open: true,
      title: "Cancel Subscription",
      message: `Cancel subscription for "${user.email}"?`,
      onConfirm: async () => {
        setDeleting(true);
        try {
          await cancelUserSubscription(String(user.id));
          showMessage("Subscription cancelled");
          await loadUsers();
        } catch (e: any) {
          showMessage(e.message, "error");
        }
        setDeleting(false);
        setDeleteModal((d) => ({ ...d, open: false }));
      },
    });
  };

  if (isChecking || loading)
    return <LoadingState message="Loading admin panel…" />;
  if (error) return <ErrorState error={error} onRetry={loadAll} />;

  const stats = {
    leagues: leagues.length,
    teams: teams.length,
    matches: totalMatches,
    streams: streams.filter((s) => s.isActive).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-sm text-slate-400">
              Manage your football platform
            </p>
          </div>
        </div>

        {message && <AlertMessage message={message} />}

        {/* Tabs */}
        <AdminPanelTabs active={activeTab} onChange={setActiveTab} />

        {/* Tab content */}
        <div className="space-y-6">
          {activeTab === "overview" && <StatsCards stats={stats} />}

          {activeTab === "leagues" && (
            <>
              <LeagueBrowser
                leagues={leagues}
                onEdit={(l) => {
                  setEditLeague(l);
                  setLeagueModalOpen(true);
                }}
                onDelete={handleLeagueDelete}
                onAdd={() => {
                  setEditLeague(null);
                  setLeagueModalOpen(true);
                }}
                onSync={handleLeagueSync}
                onBulkSync={handleBulkSync}
                syncing={syncingLeague}
                bulkSyncing={bulkSyncing}
              />
              <LeagueEditModal
                league={editLeague}
                isOpen={leagueModalOpen}
                onClose={() => setLeagueModalOpen(false)}
                onSave={handleLeagueSave}
                saving={saving}
              />
            </>
          )}

          {activeTab === "teams" && (
            <>
              <TeamBrowser
                teams={teams}
                onEdit={(t) => {
                  setEditTeam(t);
                  setTeamModalOpen(true);
                }}
                onDelete={handleTeamDelete}
                onAdd={() => {
                  setEditTeam(null);
                  setTeamModalOpen(true);
                }}
              />
              <TeamEditModal
                team={editTeam}
                leagues={leagues}
                isOpen={teamModalOpen}
                onClose={() => setTeamModalOpen(false)}
                onSave={handleTeamSave}
                saving={saving}
              />
            </>
          )}

          {activeTab === "matches" && (
            <>
              <MatchBrowser
                matches={matches}
                leagues={leagues}
                onEdit={(m) => {
                  setEditMatch(m);
                  setMatchModalOpen(true);
                }}
                onDelete={handleMatchDelete}
                onAdd={() => {
                  setEditMatch(null);
                  setMatchModalOpen(true);
                }}
                onSync={handleSyncLiveMatches}
                onGenerateAI={handleGenerateAI}
                syncing={syncingMatches}
                currentPage={matchPage}
                totalPages={Math.ceil(totalMatches / 10)}
                onPageChange={setMatchPage}
                statusFilter={matchStatusFilter}
                leagueFilter={matchLeagueFilter}
                onStatusFilterChange={setMatchStatusFilter}
                onLeagueFilterChange={setMatchLeagueFilter}
              />
              <MatchEditModal
                match={editMatch}
                teams={teams}
                leagues={leagues}
                isOpen={matchModalOpen}
                onClose={() => setMatchModalOpen(false)}
                onSave={handleMatchSave}
                saving={saving}
              />
            </>
          )}

          {activeTab === "streams" && (
            <>
              <StreamBrowser
                streams={streams}
                onEdit={(s) => {
                  setEditStream(s);
                  setStreamModalOpen(true);
                }}
                onDelete={handleStreamDelete}
                onYoutubeSearch={handleYoutubeSearch}
                onBulkSearch={handleBulkYoutubeSearch}
                bulkSearching={bulkYoutubeSearching}
              />
              <StreamEditModal
                stream={editStream}
                isOpen={streamModalOpen}
                onClose={() => setStreamModalOpen(false)}
                onSave={handleStreamSave}
                saving={saving}
              />
            </>
          )}

          {activeTab === "users" && (
            <>
              <UserBrowser
                users={users}
                onEdit={(u) => {
                  setEditUser(u);
                  setUserModalOpen(true);
                }}
                onDelete={handleUserDelete}
                onCancelSubscription={handleCancelSubscription}
                currentPage={userPage}
                totalPages={Math.ceil(totalUsers / 10)}
                onPageChange={setUserPage}
                searchQuery={userSearch}
                onSearchChange={setUserSearch}
              />
              <UserEditModal
                user={editUser}
                isOpen={userModalOpen}
                onClose={() => setUserModalOpen(false)}
                onSave={handleUserSave}
                saving={saving}
              />
            </>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        title={deleteModal.title}
        message={deleteModal.message}
        onConfirm={deleteModal.onConfirm}
        onCancel={() => setDeleteModal((d) => ({ ...d, open: false }))}
        isDeleting={deleting}
      />
    </div>
  );
}
