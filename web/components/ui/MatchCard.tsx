import Link from "next/link";
import { Calendar, MapPin, ChevronRight } from "lucide-react";

interface TeamData {
  name: string;
  logo: string | null;
}

interface League {
  name: string;
}

interface MatchCardProps {
  matchId: string;
  homeTeam: TeamData;
  awayTeam: TeamData;
  kickoffTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  score: string | null;
  venue: string | null;
  league: League;
  currentTeamName?: string; // To highlight the current team's score
  variant?: "upcoming" | "finished";
}

export function MatchCard({
  matchId,
  homeTeam,
  awayTeam,
  kickoffTime,
  status,
  score,
  venue,
  league,
  currentTeamName,
  variant = "upcoming",
}: MatchCardProps) {
  const isUpcoming = variant === "upcoming";
  const accentColor = isUpcoming ? "blue" : "green";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderScore = () => {
    if (!score) return null;
    const [homeScore, awayScore] = score.split("-").map(Number);

    return (
      <div className="px-5 py-3 bg-slate-800/90 rounded-xl border border-slate-700/50 min-w-[100px] flex items-center justify-center gap-3">
        <span
          className={`text-xl font-bold ${
            currentTeamName &&
            homeTeam.name === currentTeamName &&
            homeScore > awayScore
              ? "text-green-400"
              : "text-white"
          }`}
        >
          {homeScore}
        </span>
        <span className="text-slate-600 font-bold">-</span>
        <span
          className={`text-xl font-bold ${
            currentTeamName &&
            awayTeam.name === currentTeamName &&
            awayScore > homeScore
              ? "text-green-400"
              : "text-white"
          }`}
        >
          {awayScore}
        </span>
      </div>
    );
  };

  const renderMatchResult = () => {
    if (!score || !currentTeamName) return null;

    const [homeScore, awayScore] = score.split("-").map(Number);
    const isWin =
      (homeTeam.name === currentTeamName && homeScore > awayScore) ||
      (awayTeam.name === currentTeamName && awayScore > homeScore);
    const isDraw = homeScore === awayScore;

    return (
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
            isWin
              ? "bg-green-500/20 border border-green-500/30 text-green-400"
              : isDraw
                ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400"
                : "bg-red-500/20 border border-red-500/30 text-red-400"
          }`}
        >
          {isWin ? "W" : isDraw ? "D" : "L"}
        </div>
        <span
          className={`text-sm font-semibold ${
            isWin
              ? "text-green-400"
              : isDraw
                ? "text-yellow-400"
                : "text-red-400"
          }`}
        >
          {isWin ? "Victory" : isDraw ? "Draw" : "Defeat"}
        </span>
      </div>
    );
  };

  return (
    <Link
      href={`/match/${matchId}`}
      className={`block bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-${accentColor}-500/50 hover:shadow-lg hover:shadow-${accentColor}-500/10 transition-all duration-300 group`}
    >
      <div className="flex items-center justify-between mb-4">
        <span
          className={`text-xs font-semibold px-3 py-1.5 bg-${accentColor}-500/10 text-${accentColor}-400 rounded-lg border border-${accentColor}-500/20`}
        >
          {isUpcoming ? league.name : "FINISHED"}
        </span>
        <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(kickoffTime)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-right">
          <span className="font-semibold text-base block truncate">
            {homeTeam.name}
          </span>
        </div>

        {isUpcoming ? (
          <div className="px-5 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700/50 group-hover:border-blue-500/30 transition-colors">
            <span className="text-sm font-bold text-slate-400 group-hover:text-blue-400 transition-colors">
              VS
            </span>
          </div>
        ) : (
          renderScore()
        )}

        <div className="flex-1">
          <span className="font-semibold text-base block truncate">
            {awayTeam.name}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
        {isUpcoming ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{venue || "TBD"}</span>
          </div>
        ) : (
          renderMatchResult()
        )}
        <ChevronRight
          className={`w-5 h-5 text-slate-600 group-hover:text-${accentColor}-400 group-hover:translate-x-1 transition-all`}
        />
      </div>
    </Link>
  );
}
