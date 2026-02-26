import type { Metadata } from "next";
import { apiGet } from "@/components/api";
import { Shell } from "@/components/layout";
import LiveMatchesClient from "./LiveMatchesClient";

interface Match {
  id: string;
  homeTeam: any;
  awayTeam: any;
  league: any;
  kickoffTime: string;
  status: string;
  score: string | null;
  venue: string | null;
  stream: any;
}

export const metadata: Metadata = {
  title: "Live Football Matches | Flacron Gamezone",
  description:
    "Watch live football matches, real-time scores, and streaming availability.",
};

export default async function LiveMatchesPage() {
  let initialMatches: Match[] = [];
  let fetchError = false;

  try {
    initialMatches = await apiGet<Match[]>("/api/matches/live");
  } catch (error) {
    console.error("Initial live fetch failed:", error);
    fetchError = true;
  }

  return (
    <Shell className="bg-[#0a0e27] flex flex-col">
      <LiveMatchesClient
        initialMatches={initialMatches}
        initialError={fetchError}
      />
    </Shell>
  );
}
