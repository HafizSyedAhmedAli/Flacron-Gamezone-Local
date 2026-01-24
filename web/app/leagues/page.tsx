"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../components/api";
import { Shell } from "../../components/layout";
import { ErrorState, LoadingState } from "@/components/ui/LoadingErrorStates";
import { LeagueCard } from "@/components/ui/LeagueCard";
import { PaginationControls } from "@/components/ui/PaginationControls";

interface League {
  id: string;
  name: string;
  country: string | null;
  logo: string;
}

interface LeaguesResponse {
  success: boolean;
  leagues: League[];
}

const ITEMS_PER_PAGE = 8;

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchLeagues = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await apiGet<LeaguesResponse>("/api/leagues");
      
      if (!response.success) {
        throw new Error("Failed to fetch leagues");
      }
      
      setLeagues(response.leagues ?? []);
    } catch (error) {
      console.error("Failed to fetch leagues:", error);
      setFetchError(
        error instanceof Error ? error.message : "Failed to load leagues",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagues();
  }, []);

  const totalPages = Math.ceil(leagues.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLeagues = leagues.slice(startIndex, endIndex);

  return (
    <Shell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">All Leagues</h1>
          <div className="text-sm text-muted-foreground">
            {leagues.length} {leagues.length === 1 ? "league" : "leagues"}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && <LoadingState message="Loading leagues..." />}

        {/* Error State */}
        {fetchError && <ErrorState error={fetchError} onRetry={fetchLeagues} />}

        {/* Content */}
        {!isLoading && !fetchError && (
          <>
            {/* Pagination Controls */}
            {leagues.length > ITEMS_PER_PAGE && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={leagues.length}
              />
            )}

            {/* Leagues Grid */}
            {currentLeagues.length > 0 ? (
              <div className="relative overflow-hidden">
                <div
                  key={currentPage}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-right-4 duration-500"
                >
                  {currentLeagues.map((league, index) => (
                    <LeagueCard
                      key={league.id}
                      id={league.id}
                      name={league.name}
                      country={league.country}
                      logo={league.logo}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-700/50">
                <p className="text-slate-500">No leagues found</p>
              </div>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}
