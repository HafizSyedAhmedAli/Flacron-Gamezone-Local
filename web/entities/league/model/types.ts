export interface League {
  id: string;
  name: string;
  country: string | null;
  logo: string | null;      
  apiLeagueId?: number | null;
}

export interface GetLeaguesResponse {
  leagues: League[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}