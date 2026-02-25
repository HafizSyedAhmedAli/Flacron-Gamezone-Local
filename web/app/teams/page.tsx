// app/teams/page.tsx
import { Metadata } from "next";
import { Shell } from "@/components/layout";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Football Teams | Browse All Competing Teams",
  description:
    "Browse all competing football teams, track their performance, win rates, and follow the action in real-time across all leagues.",
  keywords: ["football teams", "soccer teams", "team stats", "win rate", "football tournament"],
  openGraph: {
    title: "Football Teams | Browse All Competing Teams",
    description:
      "Browse all competing football teams, track their performance and win rates across all leagues.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Football Teams | Browse All Competing Teams",
    description: "Browse all competing football teams and track their performance.",
  },
};

async function getTeams() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const res = await fetch(`${baseUrl}/api/teams`, {
      next: { revalidate: 120 },
    });

    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Prevent SSR for the client component to avoid useContext/navigation hook errors
const TeamsClient = dynamic(
  () => import("./TeamsClient").then((m) => m.TeamsClient),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-5 animate-pulse"
          >
            <div className="w-20 h-20 bg-slate-700/50 rounded-lg mb-3 mx-auto" />
            <div className="h-3 bg-slate-700/50 rounded w-3/4 mx-auto mb-2" />
            <div className="h-2 bg-slate-700/50 rounded w-1/2 mx-auto" />
          </div>
        ))}
      </div>
    ),
  }
);

export default async function TeamsPage() {
  const initialTeams = await getTeams();

  return (
    <Shell>
      <TeamsClient initialTeams={initialTeams} />
    </Shell>
  );
}