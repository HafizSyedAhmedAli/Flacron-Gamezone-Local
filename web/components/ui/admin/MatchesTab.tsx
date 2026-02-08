"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Sparkles } from "lucide-react";
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
  league: { name: string } | null;
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning"> = {
      UPCOMING: "default",
      LIVE: "warning",
      FINISHED: "success",
    };

    return (
      <Badge
        variant={variants[status] || "default"}
        aria-label={`status-${status}`}
      >
        {status}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleOpenAI = (match: Match) => {
    setSelectedMatch(match);
    setAiModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Matches</h2>
        <Button onClick={onBrowse}>Browse Matches</Button>
      </div>

      {/* Matches Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Match
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  League
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {matches.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No matches found. Click "Browse Matches" to add some.
                  </td>
                </tr>
              ) : (
                matches.map((match) => (
                  <tr key={match.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {match.homeTeam.logo && (
                          <img
                            src={match.homeTeam.logo}
                            alt={`${match.homeTeam.name} logo`}
                            className="w-6 h-6 object-contain"
                          />
                        )}
                        <span className="text-sm font-medium">
                          {match.homeTeam.name}
                        </span>
                        <span className="text-muted-foreground mx-2">vs</span>
                        {match.awayTeam.logo && (
                          <img
                            src={match.awayTeam.logo}
                            alt={`${match.awayTeam.name} logo`}
                            className="w-6 h-6 object-contain"
                          />
                        )}
                        <span className="text-sm font-medium">
                          {match.awayTeam.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">
                        {match.league?.name || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(match.kickoffTime)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(match.status)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">
                        {match.score || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenAI(match)}
                          title="AI Content"
                          aria-label={`ai-${match.id}`}
                        >
                          <Sparkles className="w-4 h-4 text-purple-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(match)}
                          aria-label={`edit-${match.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(match.id)}
                          aria-label={`delete-${match.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
