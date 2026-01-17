"use client";

import { apiGet } from "@/components/api";
import { Shell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, TrendingUp, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

// Dummy data for development
const DUMMY_DATA: LeagueDetailsResponse = {
  league: {
    id: "1",
    name: "Caribbean Cup",
    country: "World",
    logo: "https://media.api-sports.io/football/leagues/462.png",
  },
  standings: [
    {
      team: {
        id: "1",
        name: "Jamaica",
        logo: "https://media.api-sports.io/football/teams/1530.png",
        apiTeamId: 1530,
      },
      played: 6,
      won: 5,
      drawn: 1,
      lost: 0,
      goalsFor: 15,
      goalsAgainst: 3,
      goalDifference: 12,
      points: 16,
    },
    {
      team: {
        id: "2",
        name: "Trinidad and Tobago",
        logo: "https://media.api-sports.io/football/teams/1527.png",
        apiTeamId: 1527,
      },
      played: 6,
      won: 4,
      drawn: 1,
      lost: 1,
      goalsFor: 12,
      goalsAgainst: 5,
      goalDifference: 7,
      points: 13,
    },
    {
      team: {
        id: "3",
        name: "Haiti",
        logo: "https://media.api-sports.io/football/teams/1532.png",
        apiTeamId: 1532,
      },
      played: 6,
      won: 3,
      drawn: 2,
      lost: 1,
      goalsFor: 10,
      goalsAgainst: 6,
      goalDifference: 4,
      points: 11,
    },
    {
      team: {
        id: "4",
        name: "Guadeloupe",
        logo: "https://media.api-sports.io/football/teams/1541.png",
        apiTeamId: 1541,
      },
      played: 6,
      won: 3,
      drawn: 1,
      lost: 2,
      goalsFor: 9,
      goalsAgainst: 8,
      goalDifference: 1,
      points: 10,
    },
    {
      team: {
        id: "5",
        name: "Martinique",
        logo: "https://media.api-sports.io/football/teams/1540.png",
        apiTeamId: 1540,
      },
      played: 6,
      won: 2,
      drawn: 2,
      lost: 2,
      goalsFor: 8,
      goalsAgainst: 8,
      goalDifference: 0,
      points: 8,
    },
    {
      team: {
        id: "6",
        name: "Cuba",
        logo: "https://media.api-sports.io/football/teams/1529.png",
        apiTeamId: 1529,
      },
      played: 6,
      won: 2,
      drawn: 1,
      lost: 3,
      goalsFor: 7,
      goalsAgainst: 9,
      goalDifference: -2,
      points: 7,
    },
    {
      team: {
        id: "7",
        name: "Suriname",
        logo: "https://media.api-sports.io/football/teams/1531.png",
        apiTeamId: 1531,
      },
      played: 6,
      won: 1,
      drawn: 2,
      lost: 3,
      goalsFor: 5,
      goalsAgainst: 10,
      goalDifference: -5,
      points: 5,
    },
    {
      team: {
        id: "8",
        name: "Grenada",
        logo: "https://media.api-sports.io/football/teams/1543.png",
        apiTeamId: 1543,
      },
      played: 6,
      won: 0,
      drawn: 0,
      lost: 6,
      goalsFor: 2,
      goalsAgainst: 19,
      goalDifference: -17,
      points: 0,
    },
  ],
  upcomingMatches: [
    {
      id: "m1",
      homeTeam: {
        id: "1",
        name: "Jamaica",
        logo: "https://media.api-sports.io/football/teams/1530.png",
        apiTeamId: 1530,
      },
      awayTeam: {
        id: "2",
        name: "Trinidad and Tobago",
        logo: "https://media.api-sports.io/football/teams/1527.png",
        apiTeamId: 1527,
      },
      kickoffTime: "2026-01-20T19:00:00Z",
      status: "UPCOMING",
      score: null,
      venue: "National Stadium, Kingston",
    },
    {
      id: "m2",
      homeTeam: {
        id: "3",
        name: "Haiti",
        logo: "https://media.api-sports.io/football/teams/1532.png",
        apiTeamId: 1532,
      },
      awayTeam: {
        id: "4",
        name: "Guadeloupe",
        logo: "https://media.api-sports.io/football/teams/1541.png",
        apiTeamId: 1541,
      },
      kickoffTime: "2026-01-21T17:00:00Z",
      status: "UPCOMING",
      score: null,
      venue: "Stade Sylvio Cator, Port-au-Prince",
    },
    {
      id: "m3",
      homeTeam: {
        id: "5",
        name: "Martinique",
        logo: "https://media.api-sports.io/football/teams/1540.png",
        apiTeamId: 1540,
      },
      awayTeam: {
        id: "6",
        name: "Cuba",
        logo: "https://media.api-sports.io/football/teams/1529.png",
        apiTeamId: 1529,
      },
      kickoffTime: "2026-01-22T20:00:00Z",
      status: "LIVE",
      score: "1-1",
      venue: "Stade Pierre-Aliker, Fort-de-France",
    },
  ],
  recentMatches: [
    {
      id: "m4",
      homeTeam: {
        id: "1",
        name: "Jamaica",
        logo: "https://media.api-sports.io/football/teams/1530.png",
        apiTeamId: 1530,
      },
      awayTeam: {
        id: "7",
        name: "Suriname",
        logo: "https://media.api-sports.io/football/teams/1531.png",
        apiTeamId: 1531,
      },
      kickoffTime: "2026-01-15T19:00:00Z",
      status: "FINISHED",
      score: "3-0",
      venue: "National Stadium, Kingston",
    },
    {
      id: "m5",
      homeTeam: {
        id: "2",
        name: "Trinidad and Tobago",
        logo: "https://media.api-sports.io/football/teams/1527.png",
        apiTeamId: 1527,
      },
      awayTeam: {
        id: "8",
        name: "Grenada",
        logo: "https://media.api-sports.io/football/teams/1543.png",
        apiTeamId: 1543,
      },
      kickoffTime: "2026-01-14T18:00:00Z",
      status: "FINISHED",
      score: "4-1",
      venue: "Hasely Crawford Stadium, Port of Spain",
    },
    {
      id: "m6",
      homeTeam: {
        id: "3",
        name: "Haiti",
        logo: "https://media.api-sports.io/football/teams/1532.png",
        apiTeamId: 1532,
      },
      awayTeam: {
        id: "5",
        name: "Martinique",
        logo: "https://media.api-sports.io/football/teams/1540.png",
        apiTeamId: 1540,
      },
      kickoffTime: "2026-01-13T17:30:00Z",
      status: "FINISHED",
      score: "2-2",
      venue: "Stade Sylvio Cator, Port-au-Prince",
    },
    {
      id: "m7",
      homeTeam: {
        id: "4",
        name: "Guadeloupe",
        logo: "https://media.api-sports.io/football/teams/1541.png",
        apiTeamId: 1541,
      },
      awayTeam: {
        id: "6",
        name: "Cuba",
        logo: "https://media.api-sports.io/football/teams/1529.png",
        apiTeamId: 1529,
      },
      kickoffTime: "2026-01-12T19:00:00Z",
      status: "FINISHED",
      score: "1-0",
      venue: "Stade René Serge Nabajoth, Les Abymes",
    },
  ],
};
interface LeagueDetailsPageProps {
  params: { leagueId: string };
}

export default function LeagueDetailsPage({ params }: LeagueDetailsPageProps) {
  const router = useRouter();
  const leagueId = params.leagueId;

  const [data, setData] = useState<LeagueDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "standings" | "fixtures" | "results"
  >("standings");

  useEffect(() => {
    const fetchLeagueDetails = async () => {
      if (!leagueId) return;

      setIsLoading(true);
      setFetchError(null);

      try {
        // Try to fetch real data
        const response = await apiGet<LeagueDetailsResponse>(
          `/api/leagues/${leagueId}`,
        );
        console.log("League details response:", response);

        // If no data, use dummy data
        if (!response.standings || response.standings.length === 0) {
          console.log("No real data, using dummy data");
          setData(DUMMY_DATA);
        } else {
          setData(response);
        }
      } catch (error) {
        console.error(
          "Failed to fetch league details, using dummy data:",
          error,
        );
        // Set error message for display
        setFetchError(
          error instanceof Error ? error.message : "Failed to load league details"
        );
        // Use dummy data on error
        setData(DUMMY_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagueDetails();
  }, [leagueId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/leagues")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leagues
        </Button>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4" />
              <p className="text-muted-foreground">Loading league details...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {fetchError && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg text-sm">
            Error: {fetchError}
          </div>
        )}

        {/* Content */}
        {!isLoading && !fetchError && data && (
          <>
            {/* League Header */}
            <div className="bg-card border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-4">
                {data.league.logo && (
                  <Image
                    src={data.league.logo}
                    alt={data.league.name}
                    width={80}
                    height={80}
                    className="rounded-lg"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold">{data.league.name}</h1>
                  {data.league.country && (
                    <p className="text-muted-foreground mt-1">
                      {data.league.country}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-700/50" role="tablist">
              <button
                id="tab-standings"
                role="tab"
                aria-selected={activeTab === "standings"}
                aria-controls="panel-standings"
                tabIndex={activeTab === "standings" ? 0 : -1}
                onClick={() => setActiveTab("standings")}
                className={`px-4 py-2 font-medium transition-colors relative ${
                  activeTab === "standings"
                    ? "text-blue-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Trophy className="w-4 h-4 inline mr-2" />
                Standings
                {activeTab === "standings" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
              <button
                id="tab-fixtures"
                role="tab"
                aria-selected={activeTab === "fixtures"}
                aria-controls="panel-fixtures"
                tabIndex={activeTab === "fixtures" ? 0 : -1}
                onClick={() => setActiveTab("fixtures")}
                className={`px-4 py-2 font-medium transition-colors relative ${
                  activeTab === "fixtures"
                    ? "text-blue-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Fixtures
                {activeTab === "fixtures" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
              <button
                id="tab-results"
                role="tab"
                aria-selected={activeTab === "results"}
                aria-controls="panel-results"
                tabIndex={activeTab === "results" ? 0 : -1}
                onClick={() => setActiveTab("results")}
                className={`px-4 py-2 font-medium transition-colors relative ${
                  activeTab === "results"
                    ? "text-blue-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Results
                {activeTab === "results" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
            </div>

            {/* Standings Tab */}
            {activeTab === "standings" && (
              <div id="panel-standings" role="tabpanel" aria-labelledby="tab-standings" className="bg-card border border-slate-700/50 rounded-xl overflow-hidden">
                {data.standings.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      No Standings Available
                    </p>
                    <p className="text-sm">
                      This league doesn't have any teams or finished matches
                      yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-800/50">
                        <tr className="text-xs text-muted-foreground">
                          <th className="text-left p-3 font-medium">#</th>
                          <th className="text-left p-3 font-medium">Team</th>
                          <th className="text-center p-3 font-medium">P</th>
                          <th className="text-center p-3 font-medium">W</th>
                          <th className="text-center p-3 font-medium">D</th>
                          <th className="text-center p-3 font-medium">L</th>
                          <th className="text-center p-3 font-medium">GF</th>
                          <th className="text-center p-3 font-medium">GA</th>
                          <th className="text-center p-3 font-medium">GD</th>
                          <th className="text-center p-3 font-medium">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.standings.map((standing, index) => (
                          <tr
                            key={standing.team.id}
                            className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="p-3">
                              <span
                                className={`font-medium ${
                                  index < 4
                                    ? "text-green-500"
                                    : index >= data.standings.length - 3
                                      ? "text-red-500"
                                      : ""
                                }`}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                {standing.team.logo && (
                                  <Image
                                    src={standing.team.logo}
                                    alt={standing.team.name}
                                    width={24}
                                    height={24}
                                    className="rounded"
                                  />
                                )}
                                <span className="font-medium">
                                  {standing.team.name}
                                </span>
                              </div>
                            </td>
                            <td className="text-center p-3">
                              {standing.played}
                            </td>
                            <td className="text-center p-3">{standing.won}</td>
                            <td className="text-center p-3">
                              {standing.drawn}
                            </td>
                            <td className="text-center p-3">{standing.lost}</td>
                            <td className="text-center p-3">
                              {standing.goalsFor}
                            </td>
                            <td className="text-center p-3">
                              {standing.goalsAgainst}
                            </td>
                            <td className="text-center p-3">
                              <span
                                className={
                                  standing.goalDifference > 0
                                    ? "text-green-500"
                                    : standing.goalDifference < 0
                                      ? "text-red-500"
                                      : ""
                                }
                              >
                                {standing.goalDifference > 0 ? "+" : ""}
                                {standing.goalDifference}
                              </span>
                            </td>
                            <td className="text-center p-3 font-bold">
                              {standing.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Fixtures Tab */}
            {activeTab === "fixtures" && (
              <div id="panel-fixtures" role="tabpanel" aria-labelledby="tab-fixtures" className="space-y-3">
                {data.upcomingMatches.length === 0 ? (
                  <div className="bg-card border border-slate-700/50 rounded-xl p-8 text-center text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      No Upcoming Fixtures
                    </p>
                    <p className="text-sm">
                      There are no scheduled matches for this league yet.
                    </p>
                  </div>
                ) : (
                  data.upcomingMatches.map((match) => (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="block bg-card border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {match.homeTeam.logo && (
                            <Image
                              src={match.homeTeam.logo}
                              alt={match.homeTeam.name}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          )}
                          <span className="font-medium">
                            {match.homeTeam.name}
                          </span>
                        </div>
                        <div className="text-center px-4">
                          <div className="text-sm text-muted-foreground">
                            {formatDate(match.kickoffTime)}
                          </div>
                          {match.status === "LIVE" && (
                            <span className="inline-block px-2 py-1 rounded bg-red-500 text-white text-xs font-bold mt-1">
                              LIVE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <span className="font-medium">
                            {match.awayTeam.name}
                          </span>
                          {match.awayTeam.logo && (
                            <Image
                              src={match.awayTeam.logo}
                              alt={match.awayTeam.name}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          )}
                        </div>
                      </div>
                      {match.venue && (
                        <div className="text-xs text-muted-foreground text-center mt-2">
                          {match.venue}
                        </div>
                      )}
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Results Tab */}
            {activeTab === "results" && (
              <div id="panel-results" role="tabpanel" aria-labelledby="tab-results" className="space-y-3">
                {data.recentMatches.length === 0 ? (
                  <div className="bg-card border border-slate-700/50 rounded-xl p-8 text-center text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      No Recent Results
                    </p>
                    <p className="text-sm">
                      There are no finished matches for this league yet.
                    </p>
                  </div>
                ) : (
                  data.recentMatches.map((match) => (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="block bg-card border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {match.homeTeam.logo && (
                            <Image
                              src={match.homeTeam.logo}
                              alt={match.homeTeam.name}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          )}
                          <span className="font-medium">
                            {match.homeTeam.name}
                          </span>
                        </div>
                        <div className="text-center px-4">
                          {match.score ? (
                            <div className="text-xl font-bold">
                              {match.score}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              No score
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(match.kickoffTime)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <span className="font-medium">
                            {match.awayTeam.name}
                          </span>
                          {match.awayTeam.logo && (
                            <Image
                              src={match.awayTeam.logo}
                              alt={match.awayTeam.name}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          )}
                        </div>
                      </div>
                      {match.venue && (
                        <div className="text-xs text-muted-foreground text-center mt-2">
                          {match.venue}
                        </div>
                      )}
                    </Link>
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
