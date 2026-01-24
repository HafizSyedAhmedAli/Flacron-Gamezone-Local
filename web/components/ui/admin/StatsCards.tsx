"use client";

import React from "react";

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
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-card border border-slate-700/50 rounded-lg p-6">
        <div className="text-muted-foreground text-sm mb-2">Total Matches</div>
        <div className="text-3xl font-bold">{matchesCount}</div>
      </div>
      <div className="bg-card border border-slate-700/50 rounded-lg p-6">
        <div className="text-muted-foreground text-sm mb-2">Total Teams</div>
        <div className="text-3xl font-bold">{teamsCount}</div>
      </div>
      <div className="bg-card border border-slate-700/50 rounded-lg p-6">
        <div className="text-muted-foreground text-sm mb-2">Total Leagues</div>
        <div className="text-3xl font-bold">{leaguesCount}</div>
      </div>
    </div>
  );
}
