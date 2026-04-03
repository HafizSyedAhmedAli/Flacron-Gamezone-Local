import { Metadata } from "next";
import { MatchesClient } from "../../page-components/matches/ui/MatchesClient";

export const metadata: Metadata = {
  title: "Football Matches | Watch Live & Upcoming Games",
  description:
    "Stream live football matches, track real-time scores, and browse upcoming fixtures.",
  keywords: [
    "live football",
    "football matches",
    "live scores",
    "upcoming fixtures",
  ],
  openGraph: {
    title: "Football Matches | Watch Live & Upcoming Games",
    description: "Stream live football matches and track real-time scores.",
    type: "website",
  },
};

async function getMatches() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

    const res = await fetch(`${baseUrl}/api/matches`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function MatchesPage() {
  const initialMatches = await getMatches();
  return <MatchesClient initialMatches={initialMatches} />;
}
