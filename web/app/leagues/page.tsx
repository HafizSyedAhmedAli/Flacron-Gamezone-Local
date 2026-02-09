"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../components/api";
import { Shell } from "../../components/layout";
import { ErrorState, LoadingState } from "@/components/ui/LoadingErrorStates";
import { LeagueCard } from "@/components/ui/LeagueCard";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { Trophy, Globe2, Sparkles } from "lucide-react";

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
      <div className="space-y-8 relative">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Premium Header Section */}
        <div className="relative overflow-hidden rounded-3xl">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
          
          <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
            {/* Football Field Pattern Background */}
            <div className="absolute inset-0 opacity-[0.2]">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}></div>
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-blue-500/20"></div>
              {/* Center Line */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-blue-500/10"></div>
            </div>

            {/* Decorative Football Icons */}
            <div className="absolute top-8 right-8 w-20 h-20 opacity-5">
              <svg viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
            
            {/* Header Content */}
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8 md:p-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-lg opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                      <Trophy className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200 mb-2">
                      Premier Leagues
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base flex items-center gap-2">
                      <Globe2 className="w-4 h-4" />
                      Discover elite football competitions worldwide
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
                  <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl px-6 py-4">
                    <div className="text-sm text-slate-400 mb-1">Total Leagues</div>
                    <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-2">
                      {leagues.length}
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Animated Line Decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
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
              <div className="relative">
                <div
                  key={currentPage}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
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
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl blur-xl"></div>
                <div className="relative text-center py-24 bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-slate-700/50">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center border border-slate-700/50">
                    <Trophy className="w-10 h-10 text-slate-600" />
                  </div>
                  <p className="text-slate-400 text-lg">No leagues found</p>
                  <p className="text-slate-500 text-sm mt-2">Check back later for updates</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}