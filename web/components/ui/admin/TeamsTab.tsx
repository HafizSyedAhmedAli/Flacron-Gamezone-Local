"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Search } from "lucide-react";

interface TeamsTabProps {
  teams: any[];
  onEdit: (team: any) => void;
  onDelete: (team: any) => void;
  onBrowse: () => void;
}

export function TeamsTab({ teams, onEdit, onDelete, onBrowse }: TeamsTabProps) {
  if (teams.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="mb-4">No teams added yet</p>
        <Button onClick={onBrowse} className="gap-2">
          <Search className="w-4 h-4" />
          Browse & Add Teams
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {teams.map((team) => (
        <div
          key={team.id}
          className="bg-card border border-slate-700/50 rounded-lg p-4 flex flex-col"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {team.logo ? (
                <img
                  src={team.logo}
                  alt={team.name}
                  className="w-16 h-16 object-contain rounded"
                />
              ) : (
                <div className="w-16 h-16 rounded bg-slate-800 flex items-center justify-center text-sm text-slate-400">
                  No logo
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="font-semibold text-lg">{team.name}</div>
              <div className="text-sm text-slate-500">
                {team.league?.name || "No league"}
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(team)}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(team)}
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
