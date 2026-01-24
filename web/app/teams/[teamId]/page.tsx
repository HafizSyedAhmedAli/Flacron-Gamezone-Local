"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../components/api";
import { Shell } from "../../../components/layout";
import {
  Trophy,
  Clock,
  Shield,
  ArrowLeft,
  Activity,
  TrendingDown,
  Target,
  Flame,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { TeamStatsCard } from "@/components/ui/TeamStatsCard";
import { MatchesSection } from "@/components/ui/MatchesSection";
import { TeamHeroSection } from "@/components/ui/TeamHeroSection";

interface League {
  id: string;
  name: string;
  country: string | null;
  logo: string | null;
}

interface TeamData {
  name: string;
  logo: string | null;
  apiTeamId: number | null;
}

interface Match {
  id: string;
  homeTeam: TeamData;
  awayTeam: TeamData;
  kickoffTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  score: string | null;
  venue: string | null;
  league: League;
}

interface TeamDetailsResponse {
  id: string;
  name: string;
  logo: string | null;
  apiTeamId: number | null;
  leagueId: string | null;
  createdAt: string;
  league: League | null;
  homeMatches: Match[];
  awayMatches: Match[];
}

interface TeamDetailPageProps {
  params: {
    teamId: string;
  };
}

export default function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamId } = params;

  const [team, setTeam] = useState<TeamDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTeam() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<TeamDetailsResponse>(`/api/teams/${teamId}`);
      setTeam(data);
    } catch (err) {
      console.error("Error loading team:", err);
      setError(err instanceof Error ? err.message : "Failed to load team");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (teamId) loadTeam();
  }, [teamId]);

  if (isLoading) {
    return (
      <Shell>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-32 bg-slate-800/50 rounded-lg" />
          <div className="h-72 bg-slate-800/50 rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-36 bg-slate-800/50 rounded-xl" />
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  if (error || !team) {
    return (
      <Shell>
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-300 mb-2">
            {error || "Team not found"}
          </h2>
          <Link
            href="/teams"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Back to Teams
          </Link>
        </div>
      </Shell>
    );
  }

  // Calculate statistics
  const allMatches = [...(team.homeMatches || []), ...(team.awayMatches || [])];
  const hasMatches = allMatches.length > 0;

  const upcomingMatches = allMatches
    .filter((m) => m.status === "UPCOMING")
    .sort(
      (a, b) =>
        new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime(),
    )
    .slice(0, 5);

  const recentMatches = allMatches
    .filter((m) => m.status === "FINISHED")
    .sort(
      (a, b) =>
        new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime(),
    )
    .slice(0, 5);

  const wins = recentMatches.filter((m) => {
    if (!m.score) return false;
    const [home, away] = m.score.split("-").map(Number);
    return (
      (m.homeTeam.name === team.name && home > away) ||
      (m.awayTeam.name === team.name && away > home)
    );
  }).length;

  const draws = recentMatches.filter((m) => {
    if (!m.score) return false;
    const [home, away] = m.score.split("-").map(Number);
    return home === away;
  }).length;

  const losses = recentMatches.length - wins - draws;
  const winRate =
    recentMatches.length > 0
      ? Math.round((wins / recentMatches.length) * 100)
      : 0;

  const lastFiveResults = recentMatches
    .slice(0, 5)
    .map((m) => {
      if (!m.score) return null;
      const [home, away] = m.score.split("-").map(Number);
      if (home === away) return "D" as const;
      return (m.homeTeam.name === team.name && home > away) ||
        (m.awayTeam.name === team.name && away > home)
        ? ("W" as const)
        : ("L" as const);
    })
    .filter((r): r is "W" | "D" | "L" => r !== null)
    .reverse();

  const finishedMatchesCount = allMatches.filter(
    (m) => m.status === "FINISHED",
  ).length;

  return (
    <Shell>
      <div className="space-y-8">
        {/* Back Button */}
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to Teams</span>
        </Link>

        {/* Hero Section */}
        <TeamHeroSection
          teamName={team.name}
          teamLogo={team.logo}
          leagueName={team.league?.name}
          leagueCountry={team.league?.country}
          lastFiveResults={lastFiveResults}
        />

        {/* No Matches Notice - Show when team has no matches */}
        {!hasMatches && (
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-200 mb-2">
                  No Match Data Available
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  This team doesn't have any matches recorded yet. Match
                  statistics and history will appear here once matches are added
                  to the system.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Show zeros when no matches */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <TeamStatsCard
            icon={Trophy}
            value={wins}
            label="Wins"
            color="green"
            showTrending
          />
          <TeamStatsCard
            icon={Activity}
            value={draws}
            label="Draws"
            color="yellow"
          />
          <TeamStatsCard
            icon={TrendingDown}
            value={losses}
            label="Losses"
            color="red"
          />
          <TeamStatsCard
            icon={Target}
            value={winRate}
            label="Win Rate"
            color="blue"
          />
          <TeamStatsCard
            icon={Flame}
            value={finishedMatchesCount}
            label="Played"
            color="purple"
          />
        </div>

        {/* Matches Section - Always show, components handle empty state */}
        <div className="grid lg:grid-cols-2 gap-6">
          <MatchesSection
            title="Upcoming Matches"
            icon={Clock}
            matches={upcomingMatches}
            variant="upcoming"
            currentTeamName={team.name}
            emptyMessage="No upcoming matches scheduled"
            iconColor="blue"
            badgeColor="blue"
          />
          <MatchesSection
            title="Recent Results"
            icon={Trophy}
            matches={recentMatches}
            variant="finished"
            currentTeamName={team.name}
            emptyMessage="No match history available"
            iconColor="green"
            badgeColor="green"
          />
        </div>
      </div>
    </Shell>
  );
}
