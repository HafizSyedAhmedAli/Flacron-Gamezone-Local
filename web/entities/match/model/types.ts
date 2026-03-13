export interface TeamRef {
  id: string;
  name: string;
  logo: string | null;
  apiTeamId?: number | null;
}

export interface LeagueRef {
  id: string;
  name: string;
  country: string | null;
  logo: string;
}

export type MatchStatus = "UPCOMING" | "LIVE" | "FINISHED";

export interface Match {
  id: string;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  league: LeagueRef | null;
  kickoffTime: string;
  status: MatchStatus;
  score: string | null;
  venue: string | null;
}

export interface SearchResults {
  leagues: LeagueRef[];
  teams: TeamRef[];
  matches: Match[];
}
