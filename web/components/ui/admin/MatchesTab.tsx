"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Search } from "lucide-react";

interface MatchesTabProps {
  matches: any[];
  onEdit: (match: any) => void;
  onDelete: (matchId: string) => void;
  onSetStatus: (matchId: string, status: string) => void;
  onBrowse: () => void;
}

export function MatchesTab({
  matches,
  onEdit,
  onDelete,
  onSetStatus,
  onBrowse,
}: MatchesTabProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No matches yet</p>
        <Button onClick={onBrowse} className="gap-2">
          <Search className="w-4 h-4" />
          Browse Matches
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const classes = {
      UPCOMING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      LIVE: "bg-green-500/20 text-green-400 border-green-500/30",
      FINISHED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs border ${classes[status as keyof typeof classes] || classes.UPCOMING}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {match.league?.logo && (
                  <img
                    src={match.league.logo}
                    alt={match.league.name}
                    className="w-6 h-6 object-contain"
                  />
                )}
                <span className="text-sm text-muted-foreground">
                  {match.league?.name || "Unknown League"}
                </span>
              </div>
              {getStatusBadge(match.status)}
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                {match.homeTeam?.logo && (
                  <img
                    src={match.homeTeam.logo}
                    alt={match.homeTeam.name}
                    className="w-8 h-8 object-contain"
                  />
                )}
                <span className="font-medium">{match.homeTeam?.name}</span>
              </div>

              <div className="px-4 font-bold text-lg">
                {match.score || "vs"}
              </div>

              <div className="flex items-center gap-3 flex-1 justify-end">
                <span className="font-medium">{match.awayTeam?.name}</span>
                {match.awayTeam?.logo && (
                  <img
                    src={match.awayTeam.logo}
                    alt={match.awayTeam.name}
                    className="w-8 h-8 object-contain"
                  />
                )}
              </div>
            </div>

            <div className="text-sm text-muted-foreground mb-3">
              {new Date(match.kickoffTime).toLocaleString()}
              {match.venue && ` • ${match.venue}`}
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(match)}
                className="gap-1"
              >
                <Edit className="w-3 h-3" />
                Edit
              </Button>

              {match.status !== "FINISHED" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onSetStatus(
                      match.id,
                      match.status === "UPCOMING" ? "LIVE" : "FINISHED",
                    )
                  }
                >
                  {match.status === "UPCOMING" ? "Set Live" : "Set Finished"}
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(match.id)}
                className="gap-1 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
