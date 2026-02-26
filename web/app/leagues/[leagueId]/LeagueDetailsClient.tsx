"use client";
import { useState } from "react";
import { StandingsTable } from "@/components/ui/StandingsTable";
import { SimpleMatchCard } from "@/components/ui/SimpleMatchCard";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/LoadingErrorStates";
import { Calendar, TrendingUp, Trophy } from "lucide-react";

type TabId = "standings" | "fixtures" | "results";

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

interface LeagueData {
  standings: StandingTeam[];
  upcomingMatches: Match[];
  recentMatches: Match[];
}

export default function LeagueDetailsClient({ data }: { data: LeagueData }) {
  const [activeTab, setActiveTab] = useState<TabId>("standings");

  const standings = data?.standings ?? [];
  const upcomingMatches = data?.upcomingMatches ?? [];
  const recentMatches = data?.recentMatches ?? [];

  const tabs = [
    {
      id: "standings",
      label: "Standings",
      icon: Trophy,
      count: standings.length,
    },
    {
      id: "fixtures",
      label: "Fixtures",
      icon: Calendar,
      count: upcomingMatches.length,
    },
    {
      id: "results",
      label: "Results",
      icon: TrendingUp,
      count: recentMatches.length,
    },
  ];

  return (
    <>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabId)}
      />

      {activeTab === "standings" && <StandingsTable standings={standings} />}

      {activeTab === "fixtures" && (
        <div className="space-y-3">
          {upcomingMatches.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-8 h-8 text-slate-600" />}
              title="No Upcoming Fixtures"
              description="There are no scheduled matches for this league yet."
            />
          ) : (
            upcomingMatches.map((match: Match) => (
              <SimpleMatchCard key={match.id} {...match} />
            ))
          )}
        </div>
      )}

      {activeTab === "results" && (
        <div className="space-y-3">
          {recentMatches.length === 0 ? (
            <EmptyState
              icon={<TrendingUp className="w-8 h-8 text-slate-600" />}
              title="No Recent Results"
              description="There are no finished matches for this league yet."
            />
          ) : (
            recentMatches.map((match: Match) => (
              <SimpleMatchCard key={match.id} {...match} />
            ))
          )}
        </div>
      )}
    </>
  );
}
