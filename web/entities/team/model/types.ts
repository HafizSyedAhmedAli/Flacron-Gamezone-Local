export interface Team {
  id: string;
  name: string;
  logo: string | null;
  apiTeamId: number | null;
  leagueId?: string | null;
  league?: { id: string; name: string; country: string | null } | null;
}
