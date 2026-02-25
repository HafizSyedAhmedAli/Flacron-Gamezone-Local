// app/matches/page.tsx
import { Metadata } from "next";
import { Shell } from "@/components/layout";
import { MatchesClient } from "./MatchesClient";

export const metadata: Metadata = {
  title: "Football Matches | Watch Live & Upcoming Games",
  description:
    "Stream live football matches, track real-time scores, and browse upcoming fixtures across all major leagues. Never miss a moment of the action.",
  keywords: [
    "live football",
    "football matches",
    "live scores",
    "upcoming fixtures",
    "football streaming",
  ],
  openGraph: {
    title: "Football Matches | Watch Live & Upcoming Games",
    description:
      "Stream live football matches, track real-time scores, and browse upcoming fixtures across all major leagues.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Football Matches | Watch Live & Upcoming Games",
    description:
      "Stream live football matches, track real-time scores, and browse upcoming fixtures.",
  },
};

async function getMatches() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const res = await fetch(`${baseUrl}/api/matches`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });

    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function MatchesPage() {
  const initialMatches = await getMatches();

  return (
    <Shell>
      <MatchesClient initialMatches={initialMatches} />
    </Shell>
  );
}