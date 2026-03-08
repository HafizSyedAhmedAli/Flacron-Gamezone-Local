// app/teams/[teamId]/page.tsx
import { Metadata } from "next";
import dynamic from "next/dynamic";

interface Props {
  params: { teamId: string };
}

async function getTeam(teamId: string) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const res = await fetch(`${baseUrl}/api/teams/${teamId}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const team = await getTeam(params.teamId);

  if (!team) {
    return {
      title: "Team Details | Football",
      description: "View team details, match history, and performance statistics.",
    };
  }

  const league = team.league?.name ?? "Football";
  const allMatches = [...(team.homeMatches || []), ...(team.awayMatches || [])];
  const pastMatches = allMatches.filter((m: any) => m.status === "FINISHED");
  const wins = pastMatches.filter((m: any) => {
    if (!m.score) return false;
    const [home, away] = m.score.split("-").map(Number);
    return (
      (m.homeTeam.name === team.name && home > away) ||
      (m.awayTeam.name === team.name && away > home)
    );
  }).length;
  const winRate =
    pastMatches.length > 0
      ? Math.round((wins / pastMatches.length) * 100)
      : 0;

  const title = `${team.name} | ${league} Team Stats & Matches`;
  const description = `Follow ${team.name} in ${league}. ${pastMatches.length} matches played, ${wins} wins, ${winRate}% win rate. View upcoming fixtures, past results, and full match history.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(team.logo && { images: [{ url: team.logo }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(team.logo && { images: [team.logo] }),
    },
  };
}

// Shell is inside TeamDetailClient now — nothing from next/navigation is imported here
const TeamDetailClient = dynamic(
  () => import("./TeamDetailClient").then((m) => m.TeamDetailClient),
  { ssr: false }
);

export default async function TeamDetailPage({ params }: Props) {
  const initialTeam = await getTeam(params.teamId);

  return <TeamDetailClient initialTeam={initialTeam} teamId={params.teamId} />;
}