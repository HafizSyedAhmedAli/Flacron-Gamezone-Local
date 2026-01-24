import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";

interface Team {
  id: string;
  name: string;
  logo: string | null;
  apiTeamId: number | null;
}

interface StandingTeam {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface StandingsTableProps {
  standings: StandingTeam[];
  promotionZones?: number; // Top N teams (green)
  relegationZones?: number; // Bottom N teams (red)
  showTeamLinks?: boolean;
}

export function StandingsTable({
  standings,
  promotionZones = 4,
  relegationZones = 3,
  showTeamLinks = true,
}: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No Standings Available</p>
        <p className="text-sm">
          This league doesn't have any teams or finished matches yet.
        </p>
      </div>
    );
  }

  const TeamName = ({
    standing,
    index,
  }: {
    standing: StandingTeam;
    index: number;
  }) => {
    const content = (
      <div className="flex items-center gap-3">
        {standing.team.logo && (
          <Image
            src={standing.team.logo}
            alt={standing.team.name}
            width={24}
            height={24}
            className="rounded"
          />
        )}
        <span className="font-medium">{standing.team.name}</span>
      </div>
    );

    if (showTeamLinks) {
      return (
        <Link
          href={`/teams/${standing.team.id}`}
          className="hover:text-blue-400 transition-colors"
        >
          {content}
        </Link>
      );
    }

    return content;
  };

  return (
    <div className="bg-card border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr className="text-xs text-muted-foreground">
              <th className="text-left p-3 font-medium">#</th>
              <th className="text-left p-3 font-medium">Team</th>
              <th className="text-center p-3 font-medium" title="Played">
                P
              </th>
              <th className="text-center p-3 font-medium" title="Won">
                W
              </th>
              <th className="text-center p-3 font-medium" title="Drawn">
                D
              </th>
              <th className="text-center p-3 font-medium" title="Lost">
                L
              </th>
              <th className="text-center p-3 font-medium" title="Goals For">
                GF
              </th>
              <th className="text-center p-3 font-medium" title="Goals Against">
                GA
              </th>
              <th
                className="text-center p-3 font-medium"
                title="Goal Difference"
              >
                GD
              </th>
              <th className="text-center p-3 font-medium" title="Points">
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => {
              const isPromotion = index < promotionZones;
              const relegationStart = standings.length - relegationZones;
              const isRelegation =
                index >= relegationStart && index >= promotionZones;
              return (
                <tr
                  key={standing.team.id}
                  className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-3">
                    <span
                      className={`font-medium ${
                        isPromotion
                          ? "text-green-500"
                          : isRelegation
                            ? "text-red-500"
                            : ""
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="p-3">
                    <TeamName standing={standing} index={index} />
                  </td>
                  <td className="text-center p-3">{standing.played}</td>
                  <td className="text-center p-3">{standing.won}</td>
                  <td className="text-center p-3">{standing.drawn}</td>
                  <td className="text-center p-3">{standing.lost}</td>
                  <td className="text-center p-3">{standing.goalsFor}</td>
                  <td className="text-center p-3">{standing.goalsAgainst}</td>
                  <td className="text-center p-3">
                    <span
                      className={
                        standing.goalDifference > 0
                          ? "text-green-500"
                          : standing.goalDifference < 0
                            ? "text-red-500"
                            : ""
                      }
                    >
                      {standing.goalDifference > 0 ? "+" : ""}
                      {standing.goalDifference}
                    </span>
                  </td>
                  <td className="text-center p-3 font-bold">
                    {standing.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
