"use client";

import { useState } from "react";
import { StandingsTable } from "@/components/ui/StandingsTable";
import { SimpleMatchCard } from "@/components/ui/SimpleMatchCard";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/LoadingErrorStates";
import { Calendar, TrendingUp, Trophy } from "lucide-react";

type TabId = "standings" | "fixtures" | "results";

export default function LeagueDetailsClient({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState<TabId>("standings");

  const tabs = [
    {
      id: "standings",
      label: "Standings",
      icon: Trophy,
      count: data?.standings?.length,
    },
    {
      id: "fixtures",
      label: "Fixtures",
      icon: Calendar,
      count: data?.upcomingMatches?.length,
    },
    {
      id: "results",
      label: "Results",
      icon: TrendingUp,
      count: data?.recentMatches?.length,
    },
  ];

  return (
    <>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabId)}
      />

      {activeTab === "standings" && (
        <StandingsTable standings={data.standings} />
      )}

      {activeTab === "fixtures" && (
        <div className="space-y-3">
          {data.upcomingMatches.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-8 h-8 text-slate-600" />}
              title="No Upcoming Fixtures"
              description="There are no scheduled matches for this league yet."
            />
          ) : (
            data.upcomingMatches.map((match: any) => (
              <SimpleMatchCard key={match.id} {...match} />
            ))
          )}
        </div>
      )}

      {activeTab === "results" && (
        <div className="space-y-3">
          {data.recentMatches.length === 0 ? (
            <EmptyState
              icon={<TrendingUp className="w-8 h-8 text-slate-600" />}
              title="No Recent Results"
              description="There are no finished matches for this league yet."
            />
          ) : (
            data.recentMatches.map((match: any) => (
              <SimpleMatchCard key={match.id} {...match} />
            ))
          )}
        </div>
      )}
    </>
  );
}
