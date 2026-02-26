"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/components/api";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  Trophy,
  Clock,
  MapPin,
  Tv,
  AlertCircle,
  PlayCircle,
  Radio,
} from "lucide-react";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

interface Team {
  id: string;
  name: string;
  logo: string | null;
}

interface League {
  id: string;
  name: string;
  country: string | null;
  logo: string | null;
}

interface Stream {
  type: "EMBED" | "NONE";
  provider: string | null;
  isActive: boolean;
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  league: League | null;
  kickoffTime: string;
  status: string;
  score: string | null;
  venue: string | null;
  stream: Stream | null;
}

export default function LiveMatchesClient({
  initialMatches,
  initialError = false,
}: {
  initialMatches: Match[];
  initialError?: boolean;
}) {
  const [matches, setMatches] = useState<Match[]>(initialMatches || []);
  const [loading, setLoading] = useState(
    initialMatches.length === 0 && !initialError,
  );
  const [error, setError] = useState(
    initialError ? "Failed to load live matches" : "",
  );
  const [lastUpdate, setLastUpdate] = useState<Date | null>(
    initialMatches.length ? new Date() : null,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let currentController: AbortController | null = null;

    async function loadMatches() {
      // Abort any previous in-flight request before starting a new one
      if (currentController) currentController.abort();
      currentController = new AbortController();

      try {
        setError("");
        const data = await apiGet<Match[]>("/api/matches/live", {
          signal: currentController.signal,
        });
        setMatches(data);
        setLastUpdate(new Date());
      } catch (e: any) {
        if ((e as Error).name === "AbortError") return;
        console.error("Error loading live matches:", e);
        setError(e?.message || "Failed to load live matches");
      } finally {
        setLoading(false);
      }
    }

    if (initialMatches.length === 0) {
      loadMatches();
    }

    const interval = setInterval(() => {
      loadMatches();
    }, 45000);

    return () => {
      clearInterval(interval);
      if (currentController) currentController.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <p className="text-slate-300 font-bold text-xl">
              ⚡ Loading live matches...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-br from-slate-900/95 to-red-900/50 border-2 border-red-500/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center">
                  <Radio className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white uppercase">
                    Live Matches
                  </h1>
                  <p className="text-sm text-red-300 font-bold mt-1">
                    🔴 Auto-updates every 45 seconds
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 font-semibold">
                  Last Update
                </div>
                <div className="text-sm text-white font-bold">
                  {mounted && lastUpdate
                    ? lastUpdate.toLocaleTimeString()
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border-2 border-red-500/50 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-300 font-bold">{error}</p>
              </div>
            </div>
          )}

          {/* Matches */}
          {matches.length > 0 ? (
            <div className="grid gap-6">
              {matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/match/${match.id}`}
                  className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-2 border-cyan-500/30 rounded-2xl p-6 hover:scale-[1.02] transition"
                >
                  <div className="space-y-4">
                    {match.league && (
                      <div className="flex items-center gap-3">
                        {match.league.logo ? (
                          <Image
                            src={match.league.logo}
                            alt={match.league.name}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        ) : (
                          <Trophy className="w-8 h-8 text-cyan-400" />
                        )}
                        <div>
                          <div className="text-sm font-black text-white">
                            {match.league.name}
                          </div>
                          {match.league.country && (
                            <div className="text-xs text-cyan-400">
                              {match.league.country}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
                      {/* Home Team */}
                      <div className="flex items-center justify-end gap-3">
                        {match.homeTeam.logo && (
                          <Image
                            src={match.homeTeam.logo}
                            alt={match.homeTeam.name}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        )}
                        <span className="font-black text-white">
                          {match.homeTeam.name}
                        </span>
                      </div>

                      {/* Score */}
                      <div className="text-3xl font-black text-cyan-400 text-center">
                        {match.score ?? "vs"}
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center justify-start gap-3">
                        {match.awayTeam.logo && (
                          <Image
                            src={match.awayTeam.logo}
                            alt={match.awayTeam.name}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        )}
                        <span className="font-black text-white">
                          {match.awayTeam.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-400 border-t pt-3">
                      {match.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {match.venue}
                        </div>
                      )}

                      {match.stream?.type === "EMBED" &&
                      match.stream.isActive ? (
                        <div className="flex items-center gap-2 text-green-400 ml-auto">
                          <PlayCircle className="w-4 h-4" />
                          Stream Available
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 ml-auto">
                          <Tv className="w-4 h-4" />
                          Score Only
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Activity className="w-12 h-12 mx-auto text-slate-600 mb-4" />
              <h3 className="text-2xl font-black text-white mb-2">
                No Live Matches
              </h3>
              <p className="text-slate-400">
                Check back soon for live football action!
              </p>
              <Link
                href="/matches"
                className="inline-flex items-center gap-2 mt-6 bg-cyan-600 text-white px-6 py-3 rounded-xl"
              >
                <Clock className="w-5 h-5" />
                View Upcoming Matches
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
