"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../components/api";
import { Shell } from "../../components/layout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { LeaguesResponse } from "../admin/page";
import Image from "next/image";

const ITEMS_PER_PAGE = 8;

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await apiGet<LeaguesResponse>("/api/leagues");
        console.log("leagues:", response);
        setLeagues(response.leagues);
      } catch (error) {
        console.error("Failed to fetch leagues:", error);
      }
    };

    fetchLeagues();
  }, []);

  const totalPages = Math.ceil(leagues.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLeagues = leagues.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <Shell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">All Leagues</h1>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground mr-2">
              Page {currentPage + 1} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
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
            {currentLeagues.map((i, index) => (
              <Link
                key={i.id}
                href={`/leagues/${i.id}`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="bg-card border border-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center hover:border-blue-500/50 transition-all duration-300 cursor-pointer group">
                  <div className="w-16 h-16 rounded-lg mb-4 flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform">
                    <Image width={80} height={80} src={i.logo} alt={i.name} />
                  </div>
                  <h3 className="font-semibold text-center">League {i.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Country {i.country}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
