"use client";

import { useState } from "react";
import { LeagueCard } from "@/components/ui/LeagueCard";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { Trophy } from "lucide-react";

interface League {
  id: string;
  name: string;
  country: string | null;
  logo: string;
}

const ITEMS_PER_PAGE = 8;

export default function LeaguesClient({ leagues }: { leagues: League[] }) {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(leagues.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLeagues = leagues.slice(startIndex, endIndex);

  return (
    <>
      {leagues.length > ITEMS_PER_PAGE && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={leagues.length}
        />
      )}

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
        <div className="relative text-center py-24">
          <Trophy className="w-10 h-10 mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg">No leagues found</p>
        </div>
      )}
    </>
  );
}
