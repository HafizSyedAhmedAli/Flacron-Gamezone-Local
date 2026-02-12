"use client";

import { apiDelete, apiGet, apiPost, apiPut } from "@/components/api";
import { Shell } from "@/components/layout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
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
import { Search, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Pagination {
  page: number;
  total: number;
  hasMore: boolean;
}

interface LeaguesResponse {
  success: boolean;
  leagues: Array<{
    apiLeagueId: number;
    name: string;
    logo: string;
    country: string;
  }>;
  pagination?: Pagination;
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
  pagination?: Pagination;
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
  pagination?: Pagination;
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

  // Total counts from database
  const [totalCounts, setTotalCounts] = useState({
    leagues: 0,
    teams: 0,
    matches: 0,
  });

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

  // API Browser pagination states
  const [leagueBrowserPagination, setLeagueBrowserPagination] = useState({
    page: 1,
    hasMore: false,
    loading: false,
    total: 0,
  });

  const [teamBrowserPagination, setTeamBrowserPagination] = useState({
    page: 1,
    hasMore: false,
    loading: false,
    total: 0,
  });

  const [matchBrowserPagination, setMatchBrowserPagination] = useState({
    page: 1,
    hasMore: false,
    loading: false,
    total: 0,
  });

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

  const [leaguesPagination, setLeaguesPagination] = useState({
    page: 1,
    hasMore: false,
    loading: false,
  });
  const [teamsPagination, setTeamsPagination] = useState({
    page: 1,
    hasMore: false,
    loading: false,
  });
  const [matchesPagination, setMatchesPagination] = useState({
    page: 1,
    hasMore: false,
    loading: false,
  });

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
      const [leaguesRes, teamsRes, matchesRes] = await Promise.all([
        apiGet<any>("/api/admin/leagues/saved?page=1&limit=12"),
        apiGet<any>("/api/admin/teams/saved?page=1&limit=12"),
        apiGet<any>("/api/admin/matches/saved?page=1&limit=12"),
      ]);

      setLeagues(leaguesRes.leagues || []);
      setLeaguesPagination({
        page: 1,
        hasMore: leaguesRes.pagination?.hasMore || false,
        loading: false,
      });

      setTeams(teamsRes.teams || []);
      setTeamsPagination({
        page: 1,
        hasMore: teamsRes.pagination?.hasMore || false,
        loading: false,
      });

      setMatches(matchesRes.matches || []);
      setMatchesPagination({
        page: 1,
        hasMore: matchesRes.pagination?.hasMore || false,
        loading: false,
      });

      // Store total counts from database
      setTotalCounts({
        leagues: leaguesRes.pagination?.total || 0,
        teams: teamsRes.pagination?.total || 0,
        matches: matchesRes.pagination?.total || 0,
      });

      try {
        const usersResponse = await apiGet<UsersResponse>("/api/admin/users");
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
    setLeagueBrowserPagination({
      page: 1,
      hasMore: false,
      loading: false,
      total: 0,
    });
    try {
      const response = await apiGet<any>("/api/admin/leagues?page=1&limit=100");
      setApiLeagues(response.leagues || []);
      setLeagueBrowserPagination({
        page: 1,
        hasMore: response.pagination?.hasMore || false,
        loading: false,
        total: response.pagination?.total || 0,
      });
      setShowLeagueBrowser(true);
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to load leagues from API", type: "error" });
    } finally {
      setBrowsingLeagues(false);
    }
  }

  async function loadMoreApiLeagues() {
    setLeagueBrowserPagination((prev) => ({ ...prev, loading: true }));
    try {
      const nextPage = leagueBrowserPagination.page + 1;
      const response = await apiGet<any>(
        `/api/admin/leagues?page=${nextPage}&limit=100`,
      );

      setApiLeagues((prev) => [...prev, ...(response.leagues || [])]);
      setLeagueBrowserPagination({
        page: nextPage,
        hasMore: response.pagination?.hasMore || false,
        loading: false,
        total: response.pagination?.total || 0,
      });
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to load more leagues", type: "error" });
      setLeagueBrowserPagination((prev) => ({ ...prev, loading: false }));
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

  async function loadMoreLeagues() {
    setLeaguesPagination((prev) => ({ ...prev, loading: true }));
    try {
      const nextPage = leaguesPagination.page + 1;
      const response = await apiGet<any>(
        `/api/admin/leagues/saved?page=${nextPage}&limit=12`,
      );

      setLeagues((prev) => [...prev, ...(response.leagues || [])]);
      setLeaguesPagination({
        page: nextPage,
        hasMore: response.pagination?.hasMore || false,
        loading: false,
      });

      setMsg({
        text: `Loaded ${response.leagues?.length || 0} more leagues`,
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to load more leagues", type: "error" });
      setLeaguesPagination((prev) => ({ ...prev, loading: false }));
    }
  }

  // ==================== TEAMS ====================

  async function browseApiTeams() {
    setBrowsingTeams(true);
    setTeamBrowserPagination({
      page: 1,
      hasMore: false,
      loading: false,
      total: 0,
    });
    try {
      const url = selectedLeagueForTeams
        ? `/api/admin/teams?leagueId=${selectedLeagueForTeams}&page=1&limit=100`
        : "/api/admin/teams?page=1&limit=100";
      const response = await apiGet<TeamsResponse>(url);
      setApiTeams(response.teams || []);
      setTeamBrowserPagination({
        page: 1,
        hasMore: response.pagination?.hasMore || false,
        loading: false,
        total: response.pagination?.total || 0,
      });
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

  async function loadMoreApiTeams() {
    setTeamBrowserPagination((prev) => ({ ...prev, loading: true }));
    try {
      const nextPage = teamBrowserPagination.page + 1;
      const url = selectedLeagueForTeams
        ? `/api/admin/teams?leagueId=${selectedLeagueForTeams}&page=${nextPage}&limit=100`
        : `/api/admin/teams?page=${nextPage}&limit=100`;
      const response = await apiGet<any>(url);

      setApiTeams((prev) => [...prev, ...(response.teams || [])]);
      setTeamBrowserPagination({
        page: nextPage,
        hasMore: response.pagination?.hasMore || false,
        loading: false,
        total: response.pagination?.total || 0,
      });
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to load more teams", type: "error" });
      setTeamBrowserPagination((prev) => ({ ...prev, loading: false }));
    }
  }

  async function handleTeamLeagueChange(leagueId: string) {
    setSelectedLeagueForTeams(leagueId);
    setTeamBrowserPagination({
      page: 1,
      hasMore: false,
      loading: false,
      total: 0,
    });
    setBrowsingTeams(true);
    try {
      const url = leagueId
        ? `/api/admin/teams?leagueId=${leagueId}&page=1&limit=100`
        : "/api/admin/teams?page=1&limit=100";
      const response = await apiGet<TeamsResponse>(url);
      setApiTeams(response.teams || []);
      setTeamBrowserPagination({
        page: 1,
        hasMore: response.pagination?.hasMore || false,
        loading: false,
        total: response.pagination?.total || 0,
      });
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

  async function loadMoreTeams() {
    setTeamsPagination((prev) => ({ ...prev, loading: true }));
    try {
      const nextPage = teamsPagination.page + 1;
      const response = await apiGet<any>(
        `/api/admin/teams/saved?page=${nextPage}&limit=12`,
      );

      setTeams((prev) => [...prev, ...(response.teams || [])]);
      setTeamsPagination({
        page: nextPage,
        hasMore: response.pagination?.hasMore || false,
        loading: false,
      });

      setMsg({
        text: `Loaded ${response.teams?.length || 0} more teams`,
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to load more teams", type: "error" });
      setTeamsPagination((prev) => ({ ...prev, loading: false }));
    }
  }

  // ==================== MATCHES ====================

  async function browseApiMatches() {
    setBrowsingMatches(true);
    setMatchBrowserPagination({
      page: 1,
      hasMore: false,
      loading: false,
      total: 0,
    });
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

      // Add pagination params
      params.append("page", "1");
      params.append("limit", "100");

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

      const url = `/api/admin/matches?${params.toString()}`;
      const response = await apiGet<any>(url);
      setApiMatches(response.matches || []);
      setMatchBrowserPagination({
        page: 1,
        hasMore: response.pagination?.hasMore || false,
        loading: false,
        total: response.pagination?.total || 0,
      });
      setShowMatchBrowser(true);
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to load matches from API", type: "error" });
    } finally {
      setBrowsingMatches(false);
    }
  }

  async function loadMoreApiMatches() {
    setMatchBrowserPagination((prev) => ({ ...prev, loading: true }));
    try {
      const nextPage = matchBrowserPagination.page + 1;
      const params = new URLSearchParams();

      if (selectedLeagueForMatches) {
        params.append("leagueId", selectedLeagueForMatches);
      }
      if (selectedDateForMatches) {
        params.append("date", selectedDateForMatches);
      }
      if (selectedStatusForMatches) {
        params.append("status", selectedStatusForMatches);
      }

      params.append("page", nextPage.toString());
      params.append("limit", "100");

      const url = `/api/admin/matches?${params.toString()}`;
      const response = await apiGet<any>(url);

      setApiMatches((prev) => [...prev, ...(response.matches || [])]);
      setMatchBrowserPagination({
        page: nextPage,
        hasMore: response.pagination?.hasMore || false,
        loading: false,
        total: response.pagination?.total || 0,
      });
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to load more matches", type: "error" });
      setMatchBrowserPagination((prev) => ({ ...prev, loading: false }));
    }
  }

  // Request sequencing refs to avoid out-of-order responses overwriting state
  const matchesRequestIdRef = useRef(0);
  const activeMatchesRequestsRef = useRef(0);

  async function handleMatchLeagueChange(leagueId: string) {
    setSelectedLeagueForMatches(leagueId);
    setMatchBrowserPagination({
      page: 1,
      hasMore: false,
      loading: false,
      total: 0,
    });
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
    setMatchBrowserPagination({
      page: 1,
      hasMore: false,
      loading: false,
      total: 0,
    });
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
    setMatchBrowserPagination({
      page: 1,
      hasMore: false,
      loading: false,
      total: 0,
    });
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

      // Add pagination - always reset to page 1 when filters change
      params.append("page", "1");
      params.append("limit", "100");

      const url = `/api/admin/matches?${params.toString()}`;
      const response = await apiGet<any>(url);

      // Only update state if this response corresponds to the latest request
      if (myRequestId === matchesRequestIdRef.current) {
        setApiMatches(response.matches || []);
        setMatchBrowserPagination({
          page: 1,
          hasMore: response.pagination?.hasMore || false,
          loading: false,
          total: response.pagination?.total || 0,
        });
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

  async function handleSetStatus(matchId: string, status: string) {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status } : m)),
    );

    try {
      await apiPut(`/api/admin/match/${matchId}`, { status });

      setMsg({
        text: `Match status updated to ${status}`,
        type: "success",
      });

      await refreshAll();
    } catch (err) {
      console.error("Failed to update match status", err);

      try {
        await refreshAll();
      } catch {
        // ignore errors from refreshAll here
      }

      setMsg({
        text: "Failed to update match status",
        type: "error",
      });
    }
  }

  async function loadMoreMatches() {
    setMatchesPagination((prev) => ({ ...prev, loading: true }));
    try {
      const nextPage = matchesPagination.page + 1;
      const response = await apiGet<any>(
        `/api/admin/matches/saved?page=${nextPage}&limit=12`,
      );

      setMatches((prev) => [...prev, ...(response.matches || [])]);
      setMatchesPagination({
        page: nextPage,
        hasMore: response.pagination?.hasMore || false,
        loading: false,
      });

      setMsg({
        text: `Loaded ${response.matches?.length || 0} more matches`,
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setMsg({ text: "Failed to load more matches", type: "error" });
      setMatchesPagination((prev) => ({ ...prev, loading: false }));
    }
  }

  // ==================== UI HELPERS ====================

  const tabButtonClass = (isActive: boolean) =>
    `items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md gap-1.5 px-3 hidden sm:inline-flex ${
      isActive ? "bg-accent dark:bg-accent/50 text-white" : ""
    }`;

  // Get pagination info text
  const getPaginationInfo = (type: "leagues" | "teams" | "matches") => {
    const data =
      type === "leagues" ? leagues : type === "teams" ? teams : matches;
    const total = totalCounts[type];

    if (total === 0) return "No items";

    const showing = data.length;
    return `Showing ${showing} of ${total}`;
  };

  // Protect admin route - automatically redirects non-admin users
  const { isChecking } = useRequireAdmin();

  return (
    <Shell>
      {isChecking ? (
        <LoadingSpinner size="lg" fullScreen />
      ) : (
        <div className="space-y-8">
          {/* Scroll to Top Button */}
          <ScrollToTop />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
              <p className="text-muted-foreground">
                Manage matches, teams, and leagues
              </p>
            </div>
            <Button
              onClick={refreshAll}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
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
            pagination={leagueBrowserPagination}
            onLoadMore={loadMoreApiLeagues}
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
            pagination={teamBrowserPagination}
            onLoadMore={loadMoreApiTeams}
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
            pagination={matchBrowserPagination}
            onLoadMore={loadMoreApiMatches}
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

          {/* Tab Selector with Count Badges */}
          <div className="flex gap-2 mt-4">
            {(["leagues", "teams", "matches", "users", "streams"] as const).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={tabButtonClass(tab === t)}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                  {t !== "users" && t !== "streams" && (
                    <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-200">
                      {totalCounts[t]}
                    </span>
                  )}
                </button>
              ),
            )}
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Loading data...</p>
              </div>
            </div>
          ) : (
            <>
              {tab === "leagues" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-400">
                      {getPaginationInfo("leagues")}
                    </p>
                  </div>
                  <LeaguesTab
                    leagues={leagues}
                    onEdit={openEditLeagueModal}
                    onDelete={openDeleteLeagueConfirm}
                    onBrowse={browseApiLeagues}
                  />
                  {leaguesPagination.hasMore && (
                    <div className="flex justify-center mt-6">
                      <Button
                        onClick={loadMoreLeagues}
                        disabled={leaguesPagination.loading}
                        variant="outline"
                        size="lg"
                        className="gap-2"
                      >
                        {leaguesPagination.loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </>
                        ) : (
                          `Load More (${Math.max(0, totalCounts.leagues - leagues.length)} remaining)`
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}

              {tab === "teams" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-400">
                      {getPaginationInfo("teams")}
                    </p>
                  </div>
                  <TeamsTab
                    teams={teams}
                    onEdit={openEditTeamModal}
                    onDelete={openDeleteTeamConfirm}
                    onBrowse={() => {
                      setSelectedLeagueForTeams("");
                      browseApiTeams();
                    }}
                  />
                  {teamsPagination.hasMore && (
                    <div className="flex justify-center mt-6">
                      <Button
                        onClick={loadMoreTeams}
                        disabled={teamsPagination.loading}
                        variant="outline"
                        size="lg"
                        className="gap-2"
                      >
                        {teamsPagination.loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </>
                        ) : (
                          `Load More (${totalCounts.teams - teams.length} remaining)`
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}

              {tab === "matches" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-400">
                      {getPaginationInfo("matches")}
                    </p>
                  </div>
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
                    onSetStatus={handleSetStatus}
                  />
                  {matchesPagination.hasMore && (
                    <div className="flex justify-center mt-6">
                      <Button
                        onClick={loadMoreMatches}
                        disabled={matchesPagination.loading}
                        variant="outline"
                        size="lg"
                        className="gap-2"
                      >
                        {matchesPagination.loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </>
                        ) : (
                          `Load More (${totalCounts.matches - matches.length} remaining)`
                        )}
                      </Button>
                    </div>
                  )}
                </>
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
            matchesCount={totalCounts.matches}
            teamsCount={totalCounts.teams}
            leaguesCount={totalCounts.leagues}
          />
        </div>
      )}
    </Shell>
  );
}
