export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { apiGet } from "@/shared/api/base";
import LiveMatchesClient from "@/pages/live/ui/LiveMatchesClient";

export const metadata: Metadata = {
  title: "Live Football Matches | Flacron Gamezone",
  description:
    "Watch live football matches, real-time scores, and streaming availability.",
};

export default async function LiveMatchesPage() {
  let initialMatches: any[] = [];
  let fetchError = false;

  try {
    initialMatches = await apiGet<any[]>("/api/matches/live");
  } catch {
    fetchError = true;
  }

  return (
    <div className="bg-[#0a0e27] flex flex-col min-h-screen">
      <LiveMatchesClient
        initialMatches={initialMatches}
        initialError={fetchError}
      />
    </div>
  );
}
