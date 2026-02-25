import type { Metadata } from "next";
import { apiGet } from "@/components/api";
import { Shell } from "@/components/layout";
import { BackButton } from "@/components/ui/BackButton";
import { LeagueHeader } from "@/components/ui/LeagueHeader";
import { ErrorState } from "@/components/ui/LoadingErrorStates";
import LeagueDetailsClient from "./LeagueDetailsClient";

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

export async function generateMetadata(
  { params }: LeagueDetailsPageProps
): Promise<Metadata> {
  try {
    const data = await apiGet<LeagueDetailsResponse>(
      `/api/leagues/${params.leagueId}`
    );

    return {
      title: `${data.league.name} Standings & Fixtures | Flacron Gamezone`,
      description: `View standings, fixtures and results for ${data.league.name}.`,
    };
  } catch {
    return {
      title: "League Details | Flacron Gamezone",
    };
  }
}

export default async function LeagueDetailsPage({
  params,
}: LeagueDetailsPageProps) {
  let data: LeagueDetailsResponse | null = null;
  let fetchError: string | null = null;

  try {
    data = await apiGet<LeagueDetailsResponse>(
      `/api/leagues/${params.leagueId}`
    );
  } catch (error) {
    console.error("Failed to fetch league details", error);
    fetchError =
      error instanceof Error
        ? error.message
        : "Failed to load league details";
  }

  return (
    <Shell>
      <div className="space-y-6">
        <BackButton href="/leagues" label="Back to Leagues" />

        {fetchError ? (
          <ErrorState error={fetchError} />
        ) : data ? (
          <>
            <LeagueHeader
              name={data.league.name}
              country={data.league.country}
              logo={data.league.logo}
            />

            <LeagueDetailsClient data={data} />
          </>
        ) : null}
      </div>
    </Shell>
  );
}
