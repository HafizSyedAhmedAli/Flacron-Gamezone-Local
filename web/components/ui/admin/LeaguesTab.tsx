"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Search, Trophy } from "lucide-react";

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
  if (leagues?.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <p className="text-slate-400 mb-6 text-lg">No leagues added yet</p>
        <button
          onClick={onBrowse}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-xl shadow-blue-500/20 inline-flex items-center gap-2"
        >
          <Search className="w-5 h-5" />
          Browse & Add Leagues
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {leagues.map((league) => (
        <div
          key={league.id}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-5 flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">
              {league.logo ? (
                <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <img
                    src={league.logo}
                    alt={league.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg">
                  <Trophy className="w-8 h-8 text-slate-500" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-bold text-lg text-slate-100 mb-1 truncate">
                {league.name}
              </div>
              <div className="text-sm text-slate-400">
                {league.country || "—"}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => onEdit(league)}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-blue-600 hover:to-blue-500 border border-slate-600/50 hover:border-blue-500/50 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onDelete(league)}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-red-600 hover:to-red-500 border border-slate-600/50 hover:border-red-500/50 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}