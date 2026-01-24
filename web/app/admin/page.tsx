"use client";

import { apiDelete, apiGet, apiPost, apiPut, getToken } from "@/components/api";
import { Shell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { AlertMessage } from "@/components/ui/admin/AlertMessage";
import { DeleteConfirmModal } from "@/components/ui/admin/DeleteConfirmModal";
import { LeagueBrowser } from "@/components/ui/admin/LeagueBrowser";
import { LeagueEditModal } from "@/components/ui/admin/LeagueEditModal";
import { LeaguesTab } from "@/components/ui/admin/LeaguesTab";
import { MatchesTab } from "@/components/ui/admin/MatchesTab";
import { StatsCards } from "@/components/ui/admin/StatsCards";
import { TeamBrowser } from "@/components/ui/admin/TeamBrowser";
import { TeamEditModal } from "@/components/ui/admin/TeamEditModal";
import { TeamsTab } from "@/components/ui/admin/TeamsTab";
import { UsersTab } from "@/components/ui/admin/UsersTab";

export interface LeaguesResponse {
  success: boolean;
  leagues: Array<{
    apiLeagueId: number;
    name: string;
    logo: string;
    country: string;
  }>;
}

interface TeamsResponse {
  success: boolean;
  teams: Array<{
    apiTeamId: number;
    name: string;
    logo: string;
    country: string;
    founded?: number;
    venue?: string;
  }>;
}

type TabType = "leagues" | "teams" | "matches" | "users";

export default function AdminPage() {
  // Tab state
  const [tab, setTab] = useState<TabType>("leagues");

  // Data states
  const [leagues, setLeagues] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [msg, setMsg] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // League browser states
  const [showLeagueBrowser, setShowLeagueBrowser] = useState(false);
  const [apiLeagues, setApiLeagues] = useState<any[]>([]);
  const [leagueSearchTerm, setLeagueSearchTerm] = useState("");
  const [browsingLeagues, setBrowsingLeagues] = useState(false);

  // Team browser states
  const [showTeamBrowser, setShowTeamBrowser] = useState(false);
  const [apiTeams, setApiTeams] = useState<any[]>([]);
  const [teamSearchTerm, setTeamSearchTerm] = useState("");
  const [browsingTeams, setBrowsingTeams] = useState(false);
  const [selectedLeagueForTeams, setSelectedLeagueForTeams] =
    useState<string>("");

  // League edit/delete states
  const [editingLeague, setEditingLeague] = useState<any | null>(null);
  const [showEditLeagueModal, setShowEditLeagueModal] = useState(false);
  const [savingLeague, setSavingLeague] = useState(false);
  const [leagueToDelete, setLeagueToDelete] = useState<any | null>(null);
  const [deletingLeague, setDeletingLeague] = useState(false);
  const [showDeleteLeagueConfirm, setShowDeleteLeagueConfirm] = useState(false);

  // Team edit/delete states
  const [editingTeam, setEditingTeam] = useState<any | null>(null);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<any | null>(null);
  const [deletingTeam, setDeletingTeam] = useState(false);
  const [showDeleteTeamConfirm, setShowDeleteTeamConfirm] = useState(false);

  // Check auth and load data
  useEffect(() => {
    if (!getToken()) {
      location.href = "/login";
      return;
    }
    refreshAll();
  }, []);

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  async function refreshAll() {
    setLoading(true);
    try {
      const [l, t, m] = await Promise.all([
        apiGet<any[]>("/api/admin/leagues/saved"),
        apiGet<any[]>("/api/admin/teams/saved"),
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
      setMsg({ text: "Failed to load data", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  // ==================== LEAGUES ====================

  async function browseApiLeagues() {
    setBrowsingLeagues(true);
    try {
      const response = await apiGet<LeaguesResponse>("/api/admin/leagues");
      setApiLeagues(response.leagues || []);
      setShowLeagueBrowser(true);
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to load leagues from API", type: "error" });
    } finally {
      setBrowsingLeagues(false);
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
      setMsg({ text: `Added ${league.name}`, type: "success" });
      refreshAll();
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to add league", type: "error" });
    }
  }

  function openEditLeagueModal(league: any) {
    setEditingLeague({
      id: league.id,
      name: league.name || "",
      country: league.country || "",
      logo: league.logo || "",
    });
    setShowEditLeagueModal(true);
  }

  async function saveEditingLeague() {
    if (!editingLeague) return;
    setSavingLeague(true);
    try {
      await apiPut(`/api/admin/league/${editingLeague.id}`, {
        name: editingLeague.name,
        country: editingLeague.country,
        logo: editingLeague.logo === "" ? "" : editingLeague.logo,
      });
      setMsg({ text: "League saved", type: "success" });
      setShowEditLeagueModal(false);
      setEditingLeague(null);
      refreshAll();
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to save league", type: "error" });
    } finally {
      setSavingLeague(false);
    }
  }

  function openDeleteLeagueConfirm(league: any) {
    setLeagueToDelete(league);
    setShowDeleteLeagueConfirm(true);
  }

  async function confirmDeleteLeague() {
    if (!leagueToDelete) return;
    setDeletingLeague(true);
    try {
      await apiDelete(`/api/admin/league/${leagueToDelete.id}`);
      setMsg({ text: "League deleted", type: "success" });
      setShowDeleteLeagueConfirm(false);
      setLeagueToDelete(null);
      refreshAll();
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to delete league", type: "error" });
    } finally {
      setDeletingLeague(false);
    }
  }

  // ==================== TEAMS ====================

  async function browseApiTeams() {
    setBrowsingTeams(true);
    try {
      const url = selectedLeagueForTeams
        ? `/api/admin/teams?leagueId=${selectedLeagueForTeams}`
        : "/api/admin/teams";
      const response = await apiGet<TeamsResponse>(url);
      setApiTeams(response.teams || []);
      setShowTeamBrowser(true);
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to load teams from API", type: "error" });
    } finally {
      setBrowsingTeams(false);
    }
  }

  async function handleTeamLeagueChange(leagueId: string) {
    setSelectedLeagueForTeams(leagueId);
    setBrowsingTeams(true);
    try {
      const url = leagueId
        ? `/api/admin/teams?leagueId=${leagueId}`
        : "/api/admin/teams";
      const response = await apiGet<TeamsResponse>(url);
      setApiTeams(response.teams || []);
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to load teams", type: "error" });
    } finally {
      setBrowsingTeams(false);
    }
  }

  async function addTeamFromApi(team: any) {
    try {
      await apiPost("/api/admin/team", {
        apiTeamId: team.apiTeamId,
        name: team.name,
        logo: team.logo,
        leagueId: selectedLeagueForTeams || null,
      });
      setMsg({ text: `Added ${team.name}`, type: "success" });
      refreshAll();
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to add team", type: "error" });
    }
  }

  function openEditTeamModal(team: any) {
    setEditingTeam({
      id: team.id,
      name: team.name || "",
      logo: team.logo || "",
      leagueId: team.leagueId || "",
    });
    setShowEditTeamModal(true);
  }

  async function saveEditingTeam() {
    if (!editingTeam) return;
    setSavingTeam(true);
    try {
      await apiPut(`/api/admin/team/${editingTeam.id}`, {
        name: editingTeam.name,
        logo: editingTeam.logo === "" ? "" : editingTeam.logo,
        leagueId: editingTeam.leagueId === "" ? null : editingTeam.leagueId,
      });
      setMsg({ text: "Team saved", type: "success" });
      setShowEditTeamModal(false);
      setEditingTeam(null);
      refreshAll();
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to save team", type: "error" });
    } finally {
      setSavingTeam(false);
    }
  }

  function openDeleteTeamConfirm(team: any) {
    setTeamToDelete(team);
    setShowDeleteTeamConfirm(true);
  }

  async function confirmDeleteTeam() {
    if (!teamToDelete) return;
    setDeletingTeam(true);
    try {
      await apiDelete(`/api/admin/team/${teamToDelete.id}`);
      setMsg({ text: "Team deleted", type: "success" });
      setShowDeleteTeamConfirm(false);
      setTeamToDelete(null);
      refreshAll();
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to delete team", type: "error" });
    } finally {
      setDeletingTeam(false);
    }
  }

  // ==================== MATCHES ====================

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
    setMsg({ text: "Match created", type: "success" });
    refreshAll();
  }

  async function handleUpdateScore(matchId: string, currentScore: string) {
    const score = prompt("New score?", currentScore);
    if (score) {
      try {
        await apiPut(`/api/admin/match/${matchId}`, { score });
        setMsg({ text: "Score updated", type: "success" });
        refreshAll();
      } catch (err) {
        console.error(err);
        setMsg({ text: "Failed to update score", type: "error" });
      }
    }
  }

  async function handleSetMatchStatus(matchId: string, status: string) {
    try {
      await apiPut(`/api/admin/match/${matchId}`, { status });
      setMsg({ text: "Match status updated", type: "success" });
      refreshAll();
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to update status", type: "error" });
    }
  }

  async function handleDeleteMatch(matchId: string) {
    if (!confirm("Confirm delete?")) return;
    try {
      await apiDelete(`/api/admin/match/${matchId}`);
      setMsg({ text: "Match deleted", type: "success" });
      refreshAll();
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to delete match", type: "error" });
    }
  }

  // ==================== UI HELPERS ====================

  const tabButtonClass = (isActive: boolean) =>
    `items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md gap-1.5 px-3 hidden sm:inline-flex ${
      isActive ? "bg-accent dark:bg-accent/50 text-white" : ""
    }`;

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage matches, teams, and leagues
          </p>
        </div>

        {/* Alert Message */}
        <AlertMessage message={msg} />

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap">
          <Button onClick={createMatch} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Match
          </Button>
          <Button
            onClick={() => {
              setSelectedLeagueForTeams("");
              browseApiTeams();
            }}
            className="gap-2"
            disabled={browsingTeams}
          >
            <Search className="w-4 h-4" />
            {browsingTeams ? "Loading..." : "Browse Teams"}
          </Button>
          <Button
            onClick={browseApiLeagues}
            className="gap-2"
            disabled={browsingLeagues}
          >
            <Search className="w-4 h-4" />
            {browsingLeagues ? "Loading..." : "Browse Leagues"}
          </Button>
        </div>

        {/* Modals */}
        <LeagueBrowser
          isOpen={showLeagueBrowser}
          onClose={() => setShowLeagueBrowser(false)}
          leagues={apiLeagues}
          savedLeagues={leagues}
          searchTerm={leagueSearchTerm}
          onSearchChange={setLeagueSearchTerm}
          onAddLeague={addLeagueFromApi}
          isLoading={browsingLeagues}
        />

        <TeamBrowser
          isOpen={showTeamBrowser}
          onClose={() => setShowTeamBrowser(false)}
          teams={apiTeams}
          savedTeams={teams}
          searchTerm={teamSearchTerm}
          onSearchChange={setTeamSearchTerm}
          onAddTeam={addTeamFromApi}
          leagues={leagues}
          selectedLeague={selectedLeagueForTeams}
          onLeagueChange={handleTeamLeagueChange}
          isLoading={browsingTeams}
        />

        <LeagueEditModal
          isOpen={showEditLeagueModal}
          league={editingLeague}
          onClose={() => {
            setShowEditLeagueModal(false);
            setEditingLeague(null);
          }}
          onSave={saveEditingLeague}
          onChange={(field, value) =>
            setEditingLeague((s: any) => ({ ...s, [field]: value }))
          }
          isSaving={savingLeague}
        />

        <TeamEditModal
          isOpen={showEditTeamModal}
          team={editingTeam}
          onClose={() => {
            setShowEditTeamModal(false);
            setEditingTeam(null);
          }}
          onSave={saveEditingTeam}
          onChange={(field, value) =>
            setEditingTeam((s: any) => ({ ...s, [field]: value }))
          }
          isSaving={savingTeam}
          leagues={leagues}
        />

        <DeleteConfirmModal
          isOpen={showDeleteLeagueConfirm}
          title="Confirm delete"
          message={`Are you sure you want to delete ${leagueToDelete?.name}? This action cannot be undone.`}
          onConfirm={confirmDeleteLeague}
          onCancel={() => {
            setShowDeleteLeagueConfirm(false);
            setLeagueToDelete(null);
          }}
          isDeleting={deletingLeague}
        />

        <DeleteConfirmModal
          isOpen={showDeleteTeamConfirm}
          title="Confirm delete"
          message={`Are you sure you want to delete ${teamToDelete?.name}? This action cannot be undone.`}
          onConfirm={confirmDeleteTeam}
          onCancel={() => {
            setShowDeleteTeamConfirm(false);
            setTeamToDelete(null);
          }}
          isDeleting={deletingTeam}
        />

        {/* Tab Selector */}
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

        {/* Tab Content */}
        {loading ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : (
          <>
            {tab === "leagues" && (
              <LeaguesTab
                leagues={leagues}
                onEdit={openEditLeagueModal}
                onDelete={openDeleteLeagueConfirm}
                onBrowse={browseApiLeagues}
              />
            )}

            {tab === "teams" && (
              <TeamsTab
                teams={teams}
                onEdit={openEditTeamModal}
                onDelete={openDeleteTeamConfirm}
                onBrowse={() => {
                  setSelectedLeagueForTeams("");
                  browseApiTeams();
                }}
              />
            )}

            {tab === "matches" && (
              <MatchesTab
                matches={matches}
                onUpdateScore={handleUpdateScore}
                onDelete={handleDeleteMatch}
                onSetStatus={handleSetMatchStatus}
              />
            )}

            {tab === "users" && <UsersTab users={users} />}
          </>
        )}

        {/* Stats Cards */}
        <StatsCards
          matchesCount={matches.length}
          teamsCount={teams.length}
          leaguesCount={leagues.length}
        />
      </div>
    </Shell>
  );
}
