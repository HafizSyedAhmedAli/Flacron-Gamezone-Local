"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Trophy,
  Clock,
  MapPin,
  Play,
  Sparkles,
  Globe,
  FileText,
  TrendingUp,
  Activity,
  Shield,
  Award,
  Target,
  Flame,
  Crosshair,
  AlertCircle,
  Tv,
} from "lucide-react";
import { apiGet, apiPost } from "@/components/api";
import { Shell } from "@/components/layout";

interface Team {
  id: string;
  name: string;
  logo: string | null;
  apiTeamId: number | null;
}

interface League {
  id: string;
  name: string;
  country: string | null;
  logo: string | null;
  apiLeagueId: number | null;
}

interface Stream {
  id: string;
  matchId: string;
  type: "EMBED" | "NONE";
  provider: string | null;
  url: string | null;
  isActive: boolean;
}

interface AISummary {
  id: string;
  matchId: string;
  provider: string;
  language: string;
  kind: "preview" | "summary";
  content: string;
  createdAt: string;
}

interface Match {
  id: string;
  apiFixtureId: number | null;
  leagueId: string | null;
  homeTeamId: string;
  awayTeamId: string;
  kickoffTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  score: string | null;
  venue: string | null;
  league: League | null;
  homeTeam: Team;
  awayTeam: Team;
  stream: Stream | null;
  aiTexts: AISummary[];
}

export default function MatchDetail({ params }: { params: { id: string } }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [err, setErr] = useState("");
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [generating, setGenerating] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  async function loadMatch() {
    try {
      setErr("");
      const data = await apiGet<Match>(`/api/match/${params.id}`);
      setMatch(data);
    } catch (e: any) {
      console.error("Error loading match:", e);
      setErr(e?.message || "Failed to load match details");
    }
  }

  async function loadAIContent() {
    try {
      const data = await apiGet<AISummary[]>(
        `/api/ai/match/${params.id}?language=${lang}`,
      );

      if (data && match) {
        setMatch((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            aiTexts: data,
          };
        });
      }
    } catch (e: any) {
      // Silently fail - no AI content exists yet
      console.log("No AI content found:", e?.message);
    }
  }

  useEffect(() => {
    loadMatch();
  }, [params.id]);

  useEffect(() => {
    if (match) {
      loadAIContent();
    }
  }, [lang, match?.id]);

  // Cleanup timeout on unmount to prevent state updates after unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // Generate preview once per match+language. Frontend guard + backend must enforce.
  async function generatePreview() {
    // If preview already exists, do nothing on the frontend
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

      // Update the match with new AI content
      setMatch((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          aiTexts: [...prev.aiTexts, response],
        };
      });

      setSuccessMsg("✅ Preview generated successfully!");
      // Soft refresh (re-fetches server data, keeps app state)
      router.refresh();
      await loadAIContent();
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e: any) {
      console.error("Error generating preview:", e);
      setErr(e?.message || "Failed to generate preview");
    } finally {
      setGenerating(null);
    }
  }

  // Generate summary once per match+language. Frontend guard + backend must enforce.
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

      // Update the match with new AI content
      setMatch((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          aiTexts: [...prev.aiTexts, response],
        };
      });

      setSuccessMsg("✅ Summary generated successfully!");
      router.refresh();
      await loadAIContent();
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
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
                  <Activity className="w-10 h-10 text-white" />
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
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Game Zone Style Back Button */}
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-cyan-500/30"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800/70 group-hover:bg-gradient-to-br group-hover:from-cyan-600 group-hover:to-blue-600 transition-all duration-300 shadow-lg">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wide">
              ← Back
            </span>
          </button>

          {/* Success Message */}
          {successMsg && (
            <div className="relative overflow-hidden bg-gradient-to-br from-green-900/30 to-green-800/30 border-2 border-green-500/50 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(34,197,94,0.15),transparent)]"></div>
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-green-300 font-bold">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Game Zone Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20">
            {/* Animated Gaming Background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.3)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]"></div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(6,182,212,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,_rgba(59,130,246,0.15),transparent_50%)]"></div>

            <div className="relative z-10 p-6 md:p-10">
              {/* League Badge - Gaming Style */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl border-2 border-cyan-500/50 rounded-2xl px-6 py-4 shadow-2xl">
                    {match.league?.logo ? (
                      <img
                        src={match.league.logo}
                        alt={match.league.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <Trophy className="w-10 h-10 text-cyan-400" />
                    )}
                    <div>
                      <div className="text-lg font-black text-white uppercase tracking-wide">
                        {match.league?.name || "Unknown League"}
                      </div>
                      {match.league?.country && (
                        <div className="text-xs text-cyan-400 font-bold flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          {match.league.country}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Teams Battle Zone */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8 mb-8">
                {/* Home Team */}
                <div className="text-center md:text-right">
                  <div className="relative inline-block mb-4 group">
                    <div className="absolute -inset-2 bg-gradient-to-br from-cyan-500/40 to-blue-500/40 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
                    <div className="relative">
                      {match.homeTeam?.logo ? (
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-900/90 backdrop-blur-sm rounded-2xl p-4 border-2 border-cyan-500/50 shadow-2xl group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                          <img
                            src={match.homeTeam.logo}
                            alt={match.homeTeam.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-black border-2 border-cyan-500/50 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                          {match.homeTeam?.name?.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-900">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-white mb-2 uppercase tracking-tight">
                    {match.homeTeam?.name}
                  </h2>
                  <div className="inline-flex items-center gap-2 bg-cyan-500/20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-cyan-500/30">
                    <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                      🏠 Home
                    </span>
                  </div>
                </div>

                {/* Score/VS Section - Gaming Style */}
                <div className="text-center min-w-[140px] md:min-w-[180px]">
                  {match.status === "FINISHED" || match.status === "LIVE" ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-cyan-600/20 blur-3xl"></div>
                        <div className="relative text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl tracking-tighter">
                          {match.score || "0-0"}
                        </div>
                      </div>
                      {getStatusBadge(match.status)}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getStatusBadge(match.status)}
                      <div className="flex flex-col items-center gap-2 text-sm bg-slate-900/70 backdrop-blur-sm rounded-xl px-4 py-3 border-2 border-blue-500/30 shadow-lg">
                        <Clock className="w-6 h-6 text-blue-400 animate-pulse" />
                        <div className="font-black text-white uppercase tracking-wide">
                          {new Date(match.kickoffTime).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div className="text-center md:text-left">
                  <div className="relative inline-block mb-4 group">
                    <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/40 to-purple-500/40 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
                    <div className="relative">
                      {match.awayTeam?.logo ? (
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-900/90 backdrop-blur-sm rounded-2xl p-4 border-2 border-blue-500/50 shadow-2xl group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                          <img
                            src={match.awayTeam.logo}
                            alt={match.awayTeam.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-black border-2 border-blue-500/50 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                          {match.awayTeam?.name?.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-900">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-white mb-2 uppercase tracking-tight">
                    {match.awayTeam?.name}
                  </h2>
                  <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-blue-500/30">
                    <span className="text-xs font-black text-blue-400 uppercase tracking-wider">
                      ✈️ Away
                    </span>
                  </div>
                </div>
              </div>

              {/* Venue Badge */}
              {match.venue && (
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 bg-slate-900/70 backdrop-blur-sm rounded-xl px-5 py-2.5 border border-slate-700/50 shadow-lg">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-slate-300 font-semibold">
                      {match.venue}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Gaming Style Border */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500"></div>
          </div>

          {/* Language & Stream Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Language Selector */}
            <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-6 shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(168,85,247,0.1),transparent)]"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide">
                    Language
                  </h3>
                </div>
                <select
                  className="w-full bg-slate-800/90 border-2 border-purple-500/50 rounded-xl px-5 py-3.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer hover:border-purple-400"
                  value={lang}
                  onChange={(e) => setLang(e.target.value as "en" | "fr")}
                >
                  <option value="en">🇬🇧 English</option>
                  <option value="fr">🇫🇷 French</option>
                </select>
              </div>
            </div>

            {/* Stream Section */}
            <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl p-6 shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,_rgba(6,182,212,0.1),transparent)]"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Tv className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide">
                    Live Stream
                  </h3>
                </div>
                {match.stream?.type === "EMBED" && match.stream?.isActive ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs bg-green-500/20 rounded-lg px-3 py-2 border border-green-500/30">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="font-bold text-green-400">
                        STREAM ACTIVE • {match.stream.provider}
                      </span>
                    </div>
                    <a
                      href={match.stream.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:via-blue-500 hover:to-cyan-500 text-white font-black px-6 py-4 rounded-xl shadow-lg shadow-cyan-500/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 uppercase tracking-wide"
                    >
                      <Play className="w-5 h-5 group-hover:scale-125 transition-transform" />
                      <span>Watch Live</span>
                      <Flame className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400 font-semibold">
                      🎮 Score-only mode • No stream available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Content Section - Gaming Style */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Preview */}
            <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(6,182,212,0.15),transparent)]"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-lg uppercase tracking-wide">
                        AI Preview
                      </h3>
                      <p className="text-xs text-cyan-400 font-bold">
                        ⚡ Pre-Match Analysis
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={generatePreview}
                    disabled={generating === "match-preview" || !!preview}
                    className="relative group bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-black px-5 py-3 rounded-xl text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 disabled:scale-100 disabled:cursor-not-allowed shadow-md uppercase tracking-wide"
                  >
                    {generating === "match-preview" ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Crosshair className="w-4 h-4" />
                        {preview ? "Generated" : "Generate"}
                      </span>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-5 min-h-[240px] max-h-[420px] overflow-y-auto border-2 border-cyan-500/20 backdrop-blur-sm custom-scrollbar">
                  {preview?.content ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                        {preview.content}
                      </p>
                      {preview.provider && (
                        <div className="flex items-center gap-2 pt-3 border-t border-cyan-500/30">
                          <Flame className="w-3 h-3 text-cyan-400" />
                          <span className="text-xs text-cyan-400 font-bold uppercase">
                            Powered by {preview.provider}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                      <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-sm text-slate-400 font-bold mb-1">
                        ⚡ No preview yet
                      </p>
                      <p className="text-xs text-slate-600 font-semibold">
                        AI preview can be generated once
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(168,85,247,0.15),transparent)]"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-lg uppercase tracking-wide">
                        AI Summary
                      </h3>
                      <p className="text-xs text-purple-400 font-bold">
                        🔥 Post-Match Report
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={generateSummary}
                    disabled={generating === "match-summary" || !!summary}
                    className="relative group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-black px-5 py-3 rounded-xl text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 disabled:scale-100 disabled:cursor-not-allowed shadow-md uppercase tracking-wide"
                  >
                    {generating === "match-summary" ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Crosshair className="w-4 h-4" />
                        {summary ? "Generated" : "Generate"}
                      </span>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-5 min-h-[240px] max-h-[420px] overflow-y-auto border-2 border-purple-500/20 backdrop-blur-sm custom-scrollbar">
                  {summary?.content ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                        {summary.content}
                      </p>
                      {summary.provider && (
                        <div className="flex items-center gap-2 pt-3 border-t border-purple-500/30">
                          <Flame className="w-3 h-3 text-purple-400" />
                          <span className="text-xs text-purple-400 font-bold uppercase">
                            Powered by {summary.provider}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                      <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-sm text-slate-400 font-bold mb-1">
                        🔥 No summary yet
                      </p>
                      <p className="text-xs text-slate-600 font-semibold">
                        AI summary can be generated once
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {err && (
            <div className="relative overflow-hidden bg-gradient-to-br from-red-900/30 to-red-800/30 border-2 border-red-500/50 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.15),transparent)]"></div>
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-red-300 font-bold">⚠️ {err}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            to bottom,
            rgb(6, 182, 212),
            rgb(59, 130, 246)
          );
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            to bottom,
            rgb(8, 145, 178),
            rgb(37, 99, 235)
          );
        }
      `}</style>
    </Shell>
  );
}
