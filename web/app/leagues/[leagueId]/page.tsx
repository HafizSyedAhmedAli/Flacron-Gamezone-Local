"use client";

import { apiGet } from "@/components/api";
import { Shell } from "@/components/layout";
import { BackButton } from "@/components/ui/BackButton";
import { LeagueHeader } from "@/components/ui/LeagueHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/LoadingErrorStates";
import { SimpleMatchCard } from "@/components/ui/SimpleMatchCard";
import { StandingsTable } from "@/components/ui/StandingsTable";
import { Tabs } from "@/components/ui/Tabs";
import { Calendar, TrendingUp, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Team {
  id: string;
  name: string;
  logo: string | null;
  apiTeamId: number | null;
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  score: string | null;
  venue: string | null;
}

interface StandingTeam {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface LeagueDetailsResponse {
  league: {
    id: string;
    name: string;
    country: string | null;
    logo: string | null;
  };
  standings: StandingTeam[];
  upcomingMatches: Match[];
  recentMatches: Match[];
}

interface LeagueDetailsPageProps {
  params: { leagueId: string };
}

type TabId = "standings" | "fixtures" | "results";

export default function LeagueDetailsPage({ params }: LeagueDetailsPageProps) {
  const router = useRouter();
  const { leagueId } = params;

  const [data, setData] = useState<LeagueDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("standings");

  const fetchLeagueDetails = async () => {
    if (!leagueId) return;

    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await apiGet<LeagueDetailsResponse>(
        `/api/leagues/${leagueId}`,
      );
      setData(response);
    } catch (error) {
      console.error("Failed to fetch league details", error);
      setFetchError(
        error instanceof Error
          ? error.message
          : "Failed to load league details",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagueDetails();
  }, [leagueId]);

  const tabs = [
    {
      id: "standings" as TabId,
      label: "Standings",
      icon: Trophy,
      count: data?.standings.length,
    },
    {
      id: "fixtures" as TabId,
      label: "Fixtures",
      icon: Calendar,
      count: data?.upcomingMatches.length,
    },
    {
      id: "results" as TabId,
      label: "Results",
      icon: TrendingUp,
      count: data?.recentMatches.length,
    },
  ];

  return (
    <Shell>
      <div className="space-y-6">
        {/* Back Button */}
        <BackButton href="/leagues" label="Back to Leagues" />

        {/* Loading State */}
        {isLoading && <LoadingState message="Loading league details..." />}

        {/* Error State */}
        {fetchError && (
          <ErrorState error={fetchError} onRetry={fetchLeagueDetails} />
        )}

        {/* Content */}
        {!isLoading && !fetchError && data && (
          <>
            {/* League Header */}
            <LeagueHeader
              name={data.league.name}
              country={data.league.country}
              logo={data.league.logo}
            />

            {/* Tabs */}
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as TabId)}
            />

            {/* Standings Tab */}
            {activeTab === "standings" && (
              <div
                id="panel-standings"
                role="tabpanel"
                aria-labelledby="tab-standings"
              >
                <StandingsTable standings={data.standings} />
              </div>
            )}

            {/* Fixtures Tab */}
            {activeTab === "fixtures" && (
              <div
                id="panel-fixtures"
                role="tabpanel"
                aria-labelledby="tab-fixtures"
                className="space-y-3"
              >
                {data.upcomingMatches.length === 0 ? (
                  <EmptyState
                    icon={<Calendar className="w-8 h-8 text-slate-600" />}
                    title="No Upcoming Fixtures"
                    description="There are no scheduled matches for this league yet."
                  />
                ) : (
                  data.upcomingMatches.map((match) => (
                    <SimpleMatchCard key={match.id} {...match} />
                  ))
                )}
              </div>
            )}

            {/* Results Tab */}
            {activeTab === "results" && (
              <div
                id="panel-results"
                role="tabpanel"
                aria-labelledby="tab-results"
                className="space-y-3"
              >
                {data.recentMatches.length === 0 ? (
                  <EmptyState
                    icon={<TrendingUp className="w-8 h-8 text-slate-600" />}
                    title="No Recent Results"
                    description="There are no finished matches for this league yet."
                  />
                ) : (
                  data.recentMatches.map((match) => (
                    <SimpleMatchCard key={match.id} {...match} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}
