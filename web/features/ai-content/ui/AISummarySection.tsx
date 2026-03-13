"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Bot,
  RefreshCcw,
  TrendingUp,
  Shield,
  Trophy,
  Loader2,
} from "lucide-react";
import { getAISummaries, AISummary } from "../api/aiApi";

interface AISummarySectionProps {
  matchId?: string;
  leagueId?: string;
  teamId?: string;
  autoLoad?: boolean;
  showLoadMore?: boolean;
}

export function AISummarySection({
  matchId,
  leagueId,
  teamId,
  autoLoad = false,
  showLoadMore = true,
}: AISummarySectionProps) {
  const [summaries, setSummaries] = useState<AISummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchSummaries = async (p = 0) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAISummaries(p, 5);
      if (p === 0) setSummaries(data.summaries);
      else setSummaries((prev) => [...prev, ...data.summaries]);
      setTotal(data.total);
    } catch {
      setError("Failed to load AI summaries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) fetchSummaries();
  }, [autoLoad]);

  const getTypeIcon = (type: string) => {
    if (type.includes("match")) return <TrendingUp className="w-4 h-4" />;
    if (type.includes("league")) return <Trophy className="w-4 h-4" />;
    if (type.includes("team")) return <Shield className="w-4 h-4" />;
    return <Bot className="w-4 h-4" />;
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          AI Analysis
        </h2>
        <button
          onClick={() => fetchSummaries(0)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 rounded-lg text-sm text-slate-400 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}
      {summaries.length === 0 && !loading && !error && (
        <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-700/50">
          <Bot className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-500 text-sm">
            No AI summaries yet. Generate one to see analysis here.
          </p>
        </div>
      )}
      <div className="space-y-4">
        {summaries.map((summary) => (
          <div
            key={summary.id}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-yellow-500/30 rounded-xl p-5 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-400">
                  {getTypeIcon(summary.type)}
                </div>
                <div>
                  <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                    {summary.type.replace(/_/g, " ")}
                  </div>
                  {summary.match && (
                    <div className="text-xs text-slate-500">
                      {summary.match.homeTeam.name} vs{" "}
                      {summary.match.awayTeam.name}
                    </div>
                  )}
                  {summary.league && (
                    <div className="text-xs text-slate-500">
                      {summary.league.name}
                    </div>
                  )}
                  {summary.team && (
                    <div className="text-xs text-slate-500">
                      {summary.team.name}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs text-slate-600">
                {formatDate(summary.createdAt)}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {summary.content}
            </p>
          </div>
        ))}
      </div>
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      )}
      {showLoadMore && summaries.length < total && !loading && (
        <button
          onClick={() => {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchSummaries(nextPage);
          }}
          className="w-full py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-xl text-sm text-slate-400 hover:text-white transition-all"
        >
          Load more ({total - summaries.length} remaining)
        </button>
      )}
    </div>
  );
}
