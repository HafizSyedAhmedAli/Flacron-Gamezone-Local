export interface League {
  id: string;
  name: string;
  country: string | null;
  logo: string;
  apiLeagueId?: number;
}
