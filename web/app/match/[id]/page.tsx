import { Metadata } from "next";
import { MatchDetailClient } from "../../../page-components/match-detail/ui/MatchDetailClient";

interface Props {
  params: { id: string };
}

async function getMatch(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

    const res = await fetch(`${baseUrl}/api/match/${id}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const match = await getMatch(params.id);
  if (!match)
    return {
      title: "Match Details | Football",
      description: "View live football match details.",
    };
  const homeTeam = match.homeTeam?.name ?? "Home";
  const awayTeam = match.awayTeam?.name ?? "Away";
  const league = match.league?.name ?? "Football";
  const score = match.score ? ` (${match.score})` : "";
  const status = match.status === "LIVE" ? "🔴 LIVE: " : "";
  const title = `${status}${homeTeam} vs ${awayTeam}${score} | ${league}`;
  const description = `Watch ${homeTeam} vs ${awayTeam} live${score ? ` - Score: ${match.score}` : ""}. ${league}. Live stream, real-time score updates and AI match analysis.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(match.homeTeam?.logo && { images: [{ url: match.homeTeam.logo }] }),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function MatchDetailPage({ params }: Props) {
  const initialMatch = await getMatch(params.id);
  return (
    <div className="bg-[#0a0e27] flex flex-col min-h-screen">
      <MatchDetailClient initialMatch={initialMatch} matchId={params.id} />
    </div>
  );
}
