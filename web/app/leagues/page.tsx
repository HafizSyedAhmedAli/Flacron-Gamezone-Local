import type { Metadata } from "next";
import { Shell } from "../../components/layout";
import { apiGet } from "../../components/api";
import { ErrorState } from "@/components/ui/LoadingErrorStates";
import LeaguesClient from "./LeaguesClient";
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

export const metadata: Metadata = {
  title: "Premier Football Leagues | Flacron Gamezone",
  description:
    "Explore top football leagues from around the world. View competitions, teams and stats in one place.",
  keywords: [
    "football leagues",
    "soccer leagues",
    "premier leagues",
    "world football competitions",
  ],
};

export default async function LeaguesPage() {
  let leagues: League[] = [];
  let fetchError: string | null = null;

  try {
    const response = await apiGet<LeaguesResponse>("/api/leagues");

    if (!response.success) {
      throw new Error("Failed to fetch leagues");
    }

    leagues = response.leagues ?? [];
  } catch (error) {
    console.error("Failed to fetch leagues:", error);
    fetchError =
      error instanceof Error ? error.message : "Failed to load leagues";
  }

  return (
    <Shell>
      <div className="space-y-8 relative">
        {/* HEADER (unchanged design) */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8 md:p-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                    <Trophy className="w-7 h-7 text-white" />
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
              {!fetchError && (
                <div className="text-3xl font-bold text-blue-400 flex items-center gap-2">
                  {leagues.length}
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
              )}{" "}
            </div>
          </div>
        </div>

        {fetchError ? (
          <ErrorState error={fetchError} />
        ) : (
          <LeaguesClient leagues={leagues} />
        )}
      </div>
    </Shell>
  );
}
