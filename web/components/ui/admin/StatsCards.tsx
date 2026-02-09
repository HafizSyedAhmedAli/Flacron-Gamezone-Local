"use client";

import React from "react";
import { Trophy, Users, Shield, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  matchesCount: number;
  teamsCount: number;
  leaguesCount: number;
}

export function StatsCards({
  matchesCount,
  teamsCount,
  leaguesCount,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Matches",
      value: matchesCount,
      icon: Trophy,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      shadow: "shadow-blue-500/20",
    },
    {
      label: "Total Teams",
      value: teamsCount,
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10",
      shadow: "shadow-purple-500/20",
    },
    {
      label: "Total Leagues",
      value: leaguesCount,
      icon: Shield,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/10 to-emerald-500/10",
      shadow: "shadow-green-500/20",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-5">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-6 transition-all duration-300 hover:shadow-xl ${stat.shadow} group hover:scale-105`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className={`px-3 py-1 bg-gradient-to-r ${stat.bgGradient} backdrop-blur-xl rounded-lg border border-slate-600/30`}>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
              {stat.value}
            </div>
            <div className="text-slate-400 text-sm font-medium">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}