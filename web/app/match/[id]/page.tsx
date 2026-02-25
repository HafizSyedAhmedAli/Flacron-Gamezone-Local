// app/match/[id]/page.tsx
import { Metadata } from "next";
import { Shell } from "@/components/layout";
import StreamEmbed from "@/components/ui/StreamEmbed";

interface Props {
  params: { id: string };
}

async function getMatch(id: string) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const res = await fetch(`${baseUrl}/api/match/${id}`, {
      next: { revalidate: 30 }, // revalidate every 30s for live score updates
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const match = await getMatch(params.id);

  if (!match) {
    return {
      title: "Match Details | Football",
      description: "View live football match details, scores, and AI analysis.",
    };
  }

  const homeTeam = match.homeTeam?.name ?? "Home";
  const awayTeam = match.awayTeam?.name ?? "Away";
  const league = match.league?.name ?? "Football";
  const score = match.score ? ` (${match.score})` : "";
  const status = match.status === "LIVE" ? "🔴 LIVE: " : "";

  const title = `${status}${homeTeam} vs ${awayTeam}${score} | ${league}`;
  const description = `Watch ${homeTeam} vs ${awayTeam} live${score ? ` - Score: ${match.score}` : ""}. ${league}${match.venue ? ` at ${match.venue}` : ""}. Live stream, real-time score updates and AI match analysis.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(match.homeTeam?.logo && { images: [{ url: match.homeTeam.logo }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function MatchDetailPage({ params }: Props) {
  const initialMatch = await getMatch(params.id);
  }, []);

  async function generatePreview() {
    const previewExists = match?.aiTexts?.some(
      (t) => t.kind === "preview" && t.language === lang,
    );
    if (previewExists) return;

    try {
      setGenerating("match-preview");
      setErr("");
      setSuccessMsg("");

      const response = await apiPost<AISummary>("/api/ai/match-preview", {
        matchId: params.id,
        language: lang,
      });

      setMatch((prev) =>
        prev ? { ...prev, aiTexts: [...prev.aiTexts, response] } : prev,
      );
      setSuccessMsg("✅ Preview generated successfully!");
      await loadAIContent();
      successTimeoutRef.current = setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e: any) {
      console.error("Error generating preview:", e);
      setErr(e?.message || "Failed to generate preview");
    } finally {
      setGenerating(null);
    }
  }

  async function generateSummary() {
    const summaryExists = match?.aiTexts?.some(
      (t) => t.kind === "summary" && t.language === lang,
    );
    if (summaryExists) return;

    try {
      setGenerating("match-summary");
      setErr("");
      setSuccessMsg("");

      const response = await apiPost<AISummary>("/api/ai/match-summary", {
        matchId: params.id,
        language: lang,
      });

      setMatch((prev) =>
        prev ? { ...prev, aiTexts: [...prev.aiTexts, response] } : prev,
      );
      setSuccessMsg("✅ Summary generated successfully!");
      await loadAIContent();
      successTimeoutRef.current = setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e: any) {
      console.error("Error generating summary:", e);
      setErr(e?.message || "Failed to generate summary");
    } finally {
      setGenerating(null);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIVE":
        return (
          <div className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 shadow-lg shadow-red-500/50">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl animate-pulse"></div>
            <div className="relative flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span className="text-sm font-black tracking-wider text-white uppercase">
                🔴 Live Now
              </span>
            </div>
          </div>
        );
      case "FINISHED":
        return (
          <div className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-black tracking-wider text-slate-200 uppercase">
              Full Time
            </span>
          </div>
        );
      case "UPCOMING":
        return (
          <div className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg shadow-blue-500/30">
            <Clock className="w-4 h-4 text-white animate-pulse" />
            <span className="text-sm font-black tracking-wider text-white uppercase">
              Coming Soon
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  if (err && !match) {
    return (
      <Shell className="bg-[#0a0e27] flex flex-col">
        <div className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-cyan-500/30 mb-6"
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800/70 group-hover:bg-gradient-to-br group-hover:from-cyan-600 group-hover:to-blue-600 transition-all duration-300 shadow-lg">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wide">
                ← Back
              </span>
            </button>
            <div className="relative overflow-hidden text-center py-16 bg-gradient-to-br from-slate-900/90 to-red-900/30 border-2 border-red-500/30 rounded-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.1),transparent)]"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-red-500/30">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
                <p className="text-red-400 font-bold text-xl mb-2">⚠️ {err}</p>
                <button
                  onClick={loadMatch}
                  className="mt-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  if (!match) {
    return (
      <Shell className="bg-[#0a0e27] flex flex-col">
        <div className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden text-center py-16 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-2 border-cyan-500/20 rounded-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.1),transparent)]"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl shadow-cyan-500/30">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <p className="text-slate-300 font-bold text-xl">
                  ⚡ Loading match data...
                </p>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  const aiTexts = match?.aiTexts ?? [];
  const preview = aiTexts.find(
    (x) => x.kind === "preview" && x.language === lang,
  );
  const summary = aiTexts.find(
    (x) => x.kind === "summary" && x.language === lang,
  );

  return (
    <Shell className="bg-[#0a0e27] flex flex-col">
      <MatchDetailClient initialMatch={initialMatch} matchId={params.id} />
    </Shell>
  );
}