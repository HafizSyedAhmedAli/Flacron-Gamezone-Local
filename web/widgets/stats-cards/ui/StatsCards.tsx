"use client";

import { Trophy, Users, Calendar, Play } from "lucide-react";

interface Stats {
  leagues: number;
  teams: number;
  matches: number;
  streams: number;
}

interface StatsCardsProps {
  stats: Stats;
}

const CARDS = [
  {
    key: "leagues" as const,
    label: "Leagues",
    icon: Trophy,
    color: "blue",
    gradient: "from-blue-500/20 to-blue-600/10",
  },
  {
    key: "teams" as const,
    label: "Teams",
    icon: Users,
    color: "purple",
    gradient: "from-purple-500/20 to-purple-600/10",
  },
  {
    key: "matches" as const,
    label: "Matches",
    icon: Calendar,
    color: "green",
    gradient: "from-green-500/20 to-green-600/10",
  },
  {
    key: "streams" as const,
    label: "Streams",
    icon: Play,
    color: "cyan",
    gradient: "from-cyan-500/20 to-cyan-600/10",
  },
] as const;

const colorMap = {
  blue: {
    border: "border-blue-500/20 hover:border-blue-500/40",
    icon: "bg-blue-500/20 border-blue-500/30 text-blue-400",
    text: "text-blue-400",
  },
  purple: {
    border: "border-purple-500/20 hover:border-purple-500/40",
    icon: "bg-purple-500/20 border-purple-500/30 text-purple-400",
    text: "text-purple-400",
  },
  green: {
    border: "border-green-500/20 hover:border-green-500/40",
    icon: "bg-green-500/20 border-green-500/30 text-green-400",
    text: "text-green-400",
  },
  cyan: {
    border: "border-cyan-500/20 hover:border-cyan-500/40",
    icon: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
    text: "text-cyan-400",
  },
} as const;

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(({ key, label, icon: Icon, color, gradient }) => {
        const c = colorMap[color];
        return (
          <div
            key={key}
            className={`bg-gradient-to-br ${gradient} backdrop-blur-sm border ${c.border} rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl ${c.icon} border flex items-center justify-center`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats[key].toLocaleString()}
            </div>
            <div className={`text-sm font-medium ${c.text}`}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}
