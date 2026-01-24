"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Search } from "lucide-react";

interface LeaguesTabProps {
  leagues: any[];
  onEdit: (league: any) => void;
  onDelete: (league: any) => void;
  onBrowse: () => void;
}

export function LeaguesTab({
  leagues,
  onEdit,
  onDelete,
  onBrowse,
}: LeaguesTabProps) {
  if (leagues.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="mb-4">No leagues added yet</p>
        <Button onClick={onBrowse} className="gap-2">
          <Search className="w-4 h-4" />
          Browse & Add Leagues
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {leagues.map((league) => (
        <div
          key={league.id}
          className="bg-card border border-slate-700/50 rounded-lg p-4 flex flex-col"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {league.logo ? (
                <img
                  src={league.logo}
                  alt={league.name}
                  className="w-16 h-16 object-contain rounded"
                />
              ) : (
                <div className="w-16 h-16 rounded bg-slate-800 flex items-center justify-center text-sm text-slate-400">
                  No logo
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="font-semibold text-lg">{league.name}</div>
              <div className="text-sm text-slate-500">
                {league.country || "—"}
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(league)}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(league)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
