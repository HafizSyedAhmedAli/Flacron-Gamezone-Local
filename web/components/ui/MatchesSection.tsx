import { Clock, Trophy, LucideIcon } from "lucide-react";
import { MatchCard } from "./MatchCard";

interface TeamData {
  name: string;
  logo: string | null;
}

interface League {
  name: string;
}

interface Match {
  id: string;
  homeTeam: TeamData;
  awayTeam: TeamData;
  kickoffTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  score: string | null;
  venue: string | null;
  league: League;
}

interface MatchesSectionProps {
  title: string;
  icon: LucideIcon;
  matches: Match[];
  variant: "upcoming" | "finished";
  currentTeamName?: string;
  emptyMessage: string;
  iconColor: string;
  badgeColor: string;
}

export function MatchesSection({
  title,
  icon: Icon,
  matches,
  variant,
  currentTeamName,
  emptyMessage,
  iconColor,
  badgeColor,
}: MatchesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-${iconColor}-500/10 border border-${iconColor}-500/20 flex items-center justify-center`}
          >
            <Icon className={`w-5 h-5 text-${iconColor}-400`} />
          </div>
          {title}
        </h2>
        <div
          className={`px-3 py-1.5 bg-${badgeColor}-500/10 border border-${badgeColor}-500/20 rounded-full`}
        >
          <span className={`text-sm font-semibold text-${badgeColor}-400`}>
            {matches.length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {matches.length > 0 ? (
          matches.map((match) => (
            <MatchCard
              key={match.id}
              matchId={match.id}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              kickoffTime={match.kickoffTime}
              status={match.status}
              score={match.score}
              venue={match.venue}
              league={match.league}
              currentTeamName={currentTeamName}
              variant={variant}
            />
          ))
        ) : (
          <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-700/50">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
              <Icon className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
