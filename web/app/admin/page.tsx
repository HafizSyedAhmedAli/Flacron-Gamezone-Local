"use client";

import { apiDelete, apiGet, apiPost, apiPut } from "@/components/api";
import { Shell } from "@/components/layout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AdminStreamsManagement from "@/components/ui/admin/AdminStreamsManagement";
import { AlertMessage } from "@/components/ui/admin/AlertMessage";
import { DeleteConfirmModal } from "@/components/ui/admin/DeleteConfirmModal";
import { LeagueBrowser } from "@/components/ui/admin/LeagueBrowser";
import { LeagueEditModal } from "@/components/ui/admin/LeagueEditModal";
import { LeaguesTab } from "@/components/ui/admin/LeaguesTab";
import { MatchBrowser } from "@/components/ui/admin/MatchBrowser";
import { MatchEditModal } from "@/components/ui/admin/MatchEditModal";
import { MatchesTab } from "@/components/ui/admin/MatchesTab";
import { StatsCards } from "@/components/ui/admin/StatsCards";
import { TeamBrowser } from "@/components/ui/admin/TeamBrowser";
import { TeamEditModal } from "@/components/ui/admin/TeamEditModal";
import { TeamsTab } from "@/components/ui/admin/TeamsTab";
import { UsersTab } from "@/components/ui/admin/UsersTab";
import { Button } from "@/components/ui/button";
import { useRequireAdmin } from "@/hooks/useAuth";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LeaguesResponse {
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
  message?: string;
  teams: Array<{
    apiTeamId: number;
    name: string;
    logo: string;
    country: string;
    founded?: number;
    venue?: string;
  }>;
}

interface CreateTeamResponse {
  success: boolean;
  message: string;
}

interface MatchesResponse {
  success: boolean;
  matches: Array<{
    apiFixtureId: number;
    leagueId: number;
    leagueName: string;
    leagueLogo: string;
    homeTeam: {
      id: number;
      name: string;
      logo: string;
    };
    awayTeam: {
      id: number;
      name: string;
      logo: string;
    };
    kickoffTime: string;
    status: string;
    score: string;
    venue?: string;
    round?: string;
  }>;
}

interface UsersResponse {
  success: boolean;
  users: Array<{
    id: string;
    email: string;
    role: string;
    createdAt: string;
    subscription: {
      id: string;
      status: string;
      plan: string | null;
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
      currentPeriodStart: string | null;
      currentPeriodEnd: string | null;
      cancelAtPeriodEnd: boolean;
    } | null;
  }>;
  total: number;
  stats: {
    totalUsers: number;
    activeSubscriptions: number;
    canceledSubscriptions: number;
    inactiveUsers: number;
  };
}

type TabType = "leagues" | "teams" | "matches" | "users" | "streams";

export default function AdminPage() {
  // Tab state
  const [tab, setTab] = useState<TabType>("leagues");

  // Data states
  const [leagues, setLeagues] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<{
    totalUsers: number;
    activeSubscriptions: number;
    canceledSubscriptions: number;
    inactiveUsers: number;
  } | null>(null);
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

  // Match browser states
  const [showMatchBrowser, setShowMatchBrowser] = useState(false);
  const [apiMatches, setApiMatches] = useState<any[]>([]);
  const [matchSearchTerm, setMatchSearchTerm] = useState("");
  const [browsingMatches, setBrowsingMatches] = useState(false);
  const [selectedLeagueForMatches, setSelectedLeagueForMatches] =
    useState<string>("");
  const [selectedDateForMatches, setSelectedDateForMatches] =
    useState<string>("");
  const [selectedStatusForMatches, setSelectedStatusForMatches] =
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

  // Match edit/delete states
  const [editingMatch, setEditingMatch] = useState<any | null>(null);
  const [showEditMatchModal, setShowEditMatchModal] = useState(false);
  const [savingMatch, setSavingMatch] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<any | null>(null);
  const [deletingMatch, setDeletingMatch] = useState(false);
  const [showDeleteMatchConfirm, setShowDeleteMatchConfirm] = useState(false);

  // Load data on mount
  useEffect(() => {
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
        apiGet<any[]>("/api/admin/matches/saved"),
      ]);
      setLeagues(l || []);
      setTeams(t || []);
      setMatches(m || []);

      try {
        const usersResponse = await apiGet<UsersResponse>("/api/admin/users");
        // Extract users array and stats from the response object
        setUsers(usersResponse.users || []);
        setUserStats(usersResponse.stats || null);
      } catch {
        setUsers([]);
        setUserStats(null);
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
      if (response.message) {
        setMsg({ text: response.message, type: "info" });
      }
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
      if (response.message) {
        setMsg({ text: response.message, type: "info" });
      }
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to load teams", type: "error" });
    } finally {
      setBrowsingTeams(false);
    }
  }

  async function addTeamFromApi(team: any) {
    try {
      const data = await apiPost<CreateTeamResponse>("/api/admin/team", {
        apiTeamId: team.apiTeamId,
        name: team.name,
        logo: team.logo,
        leagueId: selectedLeagueForTeams || null,
      });
      if (data.success) {
        setMsg({ text: data.message, type: "success" });
        refreshAll();
      } else {
        setMsg({ text: data.message, type: "error" });
      }
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

  async function browseApiMatches() {
    setBrowsingMatches(true);
    try {
      const params = new URLSearchParams();

      // Only apply filters if they're set
      if (selectedLeagueForMatches) {
        params.append("leagueId", selectedLeagueForMatches);
      }
      if (selectedDateForMatches) {
        params.append("date", selectedDateForMatches);
      }
      if (selectedStatusForMatches) {
        params.append("status", selectedStatusForMatches);
      }

      // If no filters at all, show a message
      if (
        !selectedLeagueForMatches &&
        !selectedDateForMatches &&
        !selectedStatusForMatches
      ) {
        setApiMatches([]);
        setShowMatchBrowser(true);
        setMsg({
          text: "Please select filters to browse matches",
          type: "info",
        });
        setBrowsingMatches(false);
        return;
      }

      const url = `/api/admin/matches${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await apiGet<MatchesResponse>(url);
      setApiMatches(response.matches || []);
      setShowMatchBrowser(true);
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to load matches from API", type: "error" });
    } finally {
      setBrowsingMatches(false);
    }
  }

  // Request sequencing refs to avoid out-of-order responses overwriting state
  const matchesRequestIdRef = useRef(0);
  const activeMatchesRequestsRef = useRef(0);

  async function handleMatchLeagueChange(leagueId: string) {
    setSelectedLeagueForMatches(leagueId);
    const requestId = ++matchesRequestIdRef.current;
    await refreshMatchesFromApi(
      leagueId,
      selectedDateForMatches,
      selectedStatusForMatches,
      requestId,
    );
  }

  async function handleMatchDateChange(date: string) {
    setSelectedDateForMatches(date);
    const requestId = ++matchesRequestIdRef.current;
    await refreshMatchesFromApi(
      selectedLeagueForMatches,
      date,
      selectedStatusForMatches,
      requestId,
    );
  }

  async function handleMatchStatusChange(status: string) {
    setSelectedStatusForMatches(status);
    const requestId = ++matchesRequestIdRef.current;
    await refreshMatchesFromApi(
      selectedLeagueForMatches,
      selectedDateForMatches,
      status,
      requestId,
    );
  }

  async function refreshMatchesFromApi(
    leagueId: string,
    date: string,
    status: string,
    requestId?: number,
  ) {
    const myRequestId = requestId ?? ++matchesRequestIdRef.current;
    activeMatchesRequestsRef.current++;
    setBrowsingMatches(true);

    try {
      const params = new URLSearchParams();
      if (leagueId) params.append("leagueId", leagueId);
      if (date) params.append("date", date);
      if (status) params.append("status", status);

      const url = `/api/admin/matches${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await apiGet<MatchesResponse>(url);

      // Only update state if this response corresponds to the latest request
      if (myRequestId === matchesRequestIdRef.current) {
        setApiMatches(response.matches || []);
        setShowMatchBrowser(true);
      } else {
        // Outdated response - ignore
        console.log("Ignored outdated matches response", myRequestId);
      }
    } catch (err) {
      // Only surface error for the latest request
      if (myRequestId === matchesRequestIdRef.current) {
        console.error(err);
        setMsg({ text: "Failed to load matches", type: "error" });
      } else {
        console.log("Ignored matches error from outdated request", myRequestId);
      }
    } finally {
      activeMatchesRequestsRef.current--;
      if (activeMatchesRequestsRef.current <= 0) {
        activeMatchesRequestsRef.current = 0;
        setBrowsingMatches(false);
      }
    }
  }

  async function addMatchFromApi(match: any) {
    try {
      // Find team IDs from saved teams by matching API IDs
      const homeTeam = teams.find((t) => t.apiTeamId === match.homeTeam.id);
      const awayTeam = teams.find((t) => t.apiTeamId === match.awayTeam.id);
      const league = leagues.find((l) => l.apiLeagueId === match.leagueId);

      if (!homeTeam || !awayTeam) {
        setMsg({
          text: "Please add both teams to your database first",
          type: "error",
        });
        return;
      }

      await apiPost("/api/admin/match", {
        apiFixtureId: match.apiFixtureId,
        leagueId: league?.id || null,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        kickoffTime: match.kickoffTime,
        status:
          match.status === "NS"
            ? "UPCOMING"
            : match.status === "LIVE"
              ? "LIVE"
              : "FINISHED",
        score: match.score,
        venue: match.venue,
      });
      setMsg({ text: `Added match to your database`, type: "success" });
      refreshAll();
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to add match", type: "error" });
    }
  }

  function openEditMatchModal(match: any) {
    setEditingMatch({
      id: match.id,
      homeTeamId: match.homeTeamId || "",
      awayTeamId: match.awayTeamId || "",
      leagueId: match.leagueId || "",
      kickoffTime: match.kickoffTime
        ? new Date(match.kickoffTime).toISOString().slice(0, 16)
        : "",
      status: match.status || "UPCOMING",
      score: match.score || "",
      venue: match.venue || "",
    });
    setShowEditMatchModal(true);
  }

  async function saveEditingMatch() {
    if (!editingMatch) return;
    setSavingMatch(true);
    try {
      await apiPut(`/api/admin/match/${editingMatch.id}`, {
        homeTeamId: editingMatch.homeTeamId,
        awayTeamId: editingMatch.awayTeamId,
        leagueId: editingMatch.leagueId === "" ? null : editingMatch.leagueId,
        kickoffTime: editingMatch.kickoffTime,
        status: editingMatch.status,
        score: editingMatch.score,
        venue: editingMatch.venue,
      });
      setMsg({ text: "Match saved", type: "success" });
      setShowEditMatchModal(false);
      setEditingMatch(null);
      refreshAll();
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to save match", type: "error" });
    } finally {
      setSavingMatch(false);
    }
  }

  function openDeleteMatchConfirm(match: any) {
    setMatchToDelete(match);
    setShowDeleteMatchConfirm(true);
  }

  async function confirmDeleteMatch() {
    if (!matchToDelete) return;
    setDeletingMatch(true);
    try {
      await apiDelete(`/api/admin/match/${matchToDelete.id}`);
      setMsg({ text: "Match deleted", type: "success" });
      setShowDeleteMatchConfirm(false);
      setMatchToDelete(null);
      refreshAll();
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to delete match", type: "error" });
    } finally {
      setDeletingMatch(false);
    }
  }

  async function handleDeleteMatch(matchId: string) {
    const match = matches.find((m) => m.id === matchId);
    if (match) {
      openDeleteMatchConfirm(match);
    }
  }

  // ==================== UI HELPERS ====================

  const tabButtonClass = (isActive: boolean) =>
    `items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md gap-1.5 px-3 hidden sm:inline-flex ${
      isActive ? "bg-accent dark:bg-accent/50 text-white" : ""
    }`;

  // Protect admin route - automatically redirects non-admin users
  const { isChecking } = useRequireAdmin();

  return (
    <Shell>
      {isChecking ? (
        <LoadingSpinner size="lg" fullScreen />
      ) : (
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
            <Button
              onClick={() => {
                setSelectedLeagueForMatches("");
                setSelectedDateForMatches("");
                setSelectedStatusForMatches("");
                browseApiMatches();
              }}
              className="gap-2"
              disabled={browsingMatches}
            >
              <Search className="w-4 h-4" />
              {browsingMatches ? "Loading..." : "Browse Matches"}
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

            <Button onClick={() => setTab("streams")} className="gap-2">
              Streams
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

          <MatchBrowser
            isOpen={showMatchBrowser}
            onClose={() => setShowMatchBrowser(false)}
            matches={apiMatches}
            savedMatches={matches}
            searchTerm={matchSearchTerm}
            onSearchChange={setMatchSearchTerm}
            onAddMatch={addMatchFromApi}
            leagues={leagues}
            selectedLeague={selectedLeagueForMatches}
            onLeagueChange={handleMatchLeagueChange}
            selectedDate={selectedDateForMatches}
            onDateChange={handleMatchDateChange}
            selectedStatus={selectedStatusForMatches}
            onStatusChange={handleMatchStatusChange}
            isLoading={browsingMatches}
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

          <MatchEditModal
            isOpen={showEditMatchModal}
            match={editingMatch}
            onClose={() => {
              setShowEditMatchModal(false);
              setEditingMatch(null);
            }}
            onSave={saveEditingMatch}
            onChange={(field, value) =>
              setEditingMatch((s: any) => ({ ...s, [field]: value }))
            }
            isSaving={savingMatch}
            leagues={leagues}
            teams={teams}
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

          <DeleteConfirmModal
            isOpen={showDeleteMatchConfirm}
            title="Confirm delete"
            message={`Are you sure you want to delete this match? This action cannot be undone.`}
            onConfirm={confirmDeleteMatch}
            onCancel={() => {
              setShowDeleteMatchConfirm(false);
              setMatchToDelete(null);
            }}
            isDeleting={deletingMatch}
          />

          {/* Tab Selector */}
          <div className="flex gap-2 mt-4">
            {(["leagues", "teams", "matches", "users", "streams"] as const).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={tabButtonClass(tab === t)}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ),
            )}
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
                  onEdit={openEditMatchModal}
                  onDelete={handleDeleteMatch}
                  onBrowse={() => {
                    setSelectedLeagueForMatches("");
                    setSelectedDateForMatches("");
                    setSelectedStatusForMatches("");
                    browseApiMatches();
                  }}
                />
              )}

              {tab === "users" && (
                <UsersTab users={users} stats={userStats || undefined} />
              )}

              {tab === "streams" && (
                <div className="pt-4">
                  <AdminStreamsManagement />
                </div>
              )}
            </>
          )}

          {/* Stats Cards */}
          <StatsCards
            matchesCount={matches.length}
            teamsCount={teams.length}
            leaguesCount={leagues.length}
          />
        </div>
      )}
    </Shell>
  );
}
