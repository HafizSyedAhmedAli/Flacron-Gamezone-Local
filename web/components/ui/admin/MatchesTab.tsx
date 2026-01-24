"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface MatchesTabProps {
  matches: any[];
  onUpdateScore: (matchId: string, currentScore: string) => void;
  onDelete: (matchId: string) => void;
  onSetStatus: (matchId: string, status: string) => void;
}

export function MatchesTab({
  matches,
  onUpdateScore,
  onDelete,
  onSetStatus,
}: MatchesTabProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No matches created yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-slate-700/50 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Recent Matches</h2>
      <div className="space-y-3">
        {matches.map((match) => (
          <div
            key={match.id}
            className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg"
          >
            <div>
              <div className="font-semibold">
                {match.homeTeam?.name || "—"} vs {match.awayTeam?.name || "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(match.kickoffTime).toLocaleString()} • {match.status}{" "}
                • Score: {match.score}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => onUpdateScore(match.id, match.score)}
              >
                <Edit className="w-4 h-4" /> EDIT
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => onDelete(match.id)}
              >
                <Trash2 className="w-4 h-4" /> DELETE
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => onSetStatus(match.id, "LIVE")}
              >
                Set LIVE
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => onSetStatus(match.id, "FINISHED")}
              >
                Set FINISHED
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
