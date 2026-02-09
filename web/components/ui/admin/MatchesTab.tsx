"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Search, Play, CheckCircle, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AIManagement } from "./AIManagement";

interface Match {
  id: string;
  homeTeam: { name: string; logo: string | null };
  awayTeam: { name: string; logo: string | null };
  league: { name: string; logo?: string } | null;
  kickoffTime: string;
  status: string;
  score: string | null;
  venue: string | null;
}

interface MatchesTabProps {
  matches: Match[];
  onEdit: (match: Match) => void;
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
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const handleOpenAI = (match: Match) => {
    setSelectedMatch(match);
    setAiModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      UPCOMING: (
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30">
          UPCOMING
        </span>
      ),
      LIVE: (
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse inline-flex items-center gap-1.5 shadow-lg shadow-red-500/30">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          LIVE
        </span>
      ),
      FINISHED: (
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 text-slate-300 border border-slate-500/30">
          FINISHED
        </span>
      ),
    };
    return badges[status as keyof typeof badges] || badges.UPCOMING;
  };

  if (matches.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
          <Play className="w-10 h-10 text-white" />
        </div>
        <p className="text-slate-400 mb-6 text-lg">No matches yet</p>
        <button
          onClick={onBrowse}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-xl shadow-blue-500/20 inline-flex items-center gap-2"
        >
          <Search className="w-5 h-5" />
          Browse Matches
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
          >
            {/* League Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {match.league?.logo && (
                  <div className="w-6 h-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded p-0.5 flex items-center justify-center">
                    <img
                      src={match.league.logo}
                      alt={match.league.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <span className="text-sm text-slate-400 font-medium">
                  {match.league?.name || "Unknown League"}
                </span>
              </div>
              {getStatusBadge(match.status)}
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                {match.homeTeam?.logo && (
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-2 flex items-center justify-center">
                    <img
                      src={match.homeTeam.logo}
                      alt={match.homeTeam.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <span className="font-semibold text-slate-100">
                  {match.homeTeam?.name}
                </span>
              </div>

              <div className="px-6 font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {match.score || "vs"}
              </div>

              <div className="flex items-center gap-3 flex-1 justify-end">
                <span className="font-semibold text-slate-100">
                  {match.awayTeam?.name}
                </span>
                {match.awayTeam?.logo && (
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-2 flex items-center justify-center">
                    <img
                      src={match.awayTeam.logo}
                      alt={match.awayTeam.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Time & Venue */}
            <div className="text-sm text-slate-400 mb-4">
              {new Date(match.kickoffTime).toLocaleString()}
              {match.venue && ` • ${match.venue}`}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleOpenAI(match)}
                className="px-4 py-2 bg-gradient-to-r from-purple-800 to-purple-700 hover:from-purple-600 hover:to-purple-500 border border-purple-600/50 hover:border-purple-500/50 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                title="AI Content"
                aria-label={`ai-${match.id}`}
              >
                <Sparkles className="w-4 h-4" />
                AI Content
              </button>

              <button
                onClick={() => onEdit(match)}
                className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-blue-600 hover:to-blue-500 border border-slate-600/50 hover:border-blue-500/50 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                aria-label={`edit-${match.id}`}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>

              {match.status !== "FINISHED" && (
                <button
                  onClick={() =>
                    onSetStatus(
                      match.id,
                      match.status === "UPCOMING" ? "LIVE" : "FINISHED",
                    )
                  }
                  className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-green-600 hover:to-green-500 border border-slate-600/50 hover:border-green-500/50 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  {match.status === "UPCOMING" ? (
                    <>
                      <Play className="w-4 h-4" />
                      Set Live
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Set Finished
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => onDelete(match.id)}
                className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-red-600 hover:to-red-500 border border-slate-600/50 hover:border-red-500/50 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                aria-label={`delete-${match.id}`}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Management Modal */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Content Management</DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <AIManagement
              match={selectedMatch}
              onSuccess={() => {
                // Optionally refresh match data here
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}