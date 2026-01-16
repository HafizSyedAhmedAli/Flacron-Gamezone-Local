"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../components/api";
import { Shell } from "../../components/layout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { LeaguesResponse } from "../admin/page";

const ITEMS_PER_PAGE = 8;

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeagues = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const response = await apiGet<LeaguesResponse>("/api/leagues");

        // ✅ make sure leagues exists
        setLeagues(response.leagues ?? []);
      } catch (error) {
        console.error("Failed to fetch leagues:", error);
        setFetchError(
          error instanceof Error ? error.message : "Failed to load leagues"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  const totalPages = Math.ceil(leagues.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLeagues = leagues.slice(startIndex, endIndex);

  return (
    <Shell>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">All Leagues</h1>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4" />
              <p className="text-muted-foreground">Loading leagues...</p>
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
        {!isLoading && !fetchError && (
          <>
            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground mr-2">
                  Page {currentPage + 1} of {totalPages || 1}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Leagues Grid */}
            <div className="relative overflow-hidden">
              <div
                key={currentPage}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-right-4 duration-500"
              >
                {currentLeagues.map((league, index) => (
                  <Link
                    key={league.id}
                    href={`/leagues/${league.id}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <div className="bg-card border border-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center hover:border-blue-500/50 transition-all duration-300 cursor-pointer group">
                      <div className="w-16 h-16 rounded-lg mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Image
                          src={league.logo}
                          alt={league.name}
                          width={80}
                          height={80}
                        />
                      </div>
                      <h3 className="font-semibold text-center">
                        {league.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {league.country}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
