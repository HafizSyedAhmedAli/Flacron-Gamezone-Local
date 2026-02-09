"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface MatchEditModalProps {
  isOpen: boolean;
  match: {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    leagueId: string;
    kickoffTime: string;
    status: string;
    score: string;
    venue: string;
  } | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: string) => void;
  isSaving: boolean;
  leagues: any[];
  teams: any[];
}

export function MatchEditModal({
  isOpen,
  match,
  onClose,
  onSave,
  onChange,
  isSaving,
  leagues,
  teams,
}: MatchEditModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const prevActiveElementRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();
  const titleIdFull = `match-edit-title-${titleId}`;
  const descIdFull = `match-edit-desc-${descId}`;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    prevActiveElementRef.current = document.activeElement as HTMLElement | null;

    const timer = setTimeout(() => {
      const modalEl = modalRef.current;
      const firstFocusable = modalEl?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (firstFocusable) {
        firstFocusable.focus();
      } else if (modalEl) {
        modalEl.focus();
      }
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Escape" || e.key === "Esc") && !isSaving) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      if (
        prevActiveElementRef.current &&
        typeof prevActiveElementRef.current.focus === "function"
      ) {
        prevActiveElementRef.current.focus();
      }
    };
  }, [isOpen, isSaving, onClose]);

  if (!isOpen || !match) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !isSaving && onClose()}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleIdFull}
        aria-describedby={descIdFull}
        tabIndex={-1}
        className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl w-full max-w-lg p-6 z-10 my-8 max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-500/10 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 id={titleIdFull} className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Edit Match
          </h3>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-700 hover:from-red-600 hover:to-red-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div id={descIdFull} className="space-y-5">
          <div>
            <label htmlFor="homeTeam" className="block text-sm font-semibold text-slate-300 mb-2">
              Home Team
            </label>
            <select
              id="homeTeam"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 transition-all focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-100"
              value={match.homeTeamId}
              onChange={(e) => onChange("homeTeamId", e.target.value)}
            >
              <option value="">Select home team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="awayTeam" className="block text-sm font-semibold text-slate-300 mb-2">
              Away Team
            </label>
            <select
              id="awayTeam"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 transition-all focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-100"
              value={match.awayTeamId}
              onChange={(e) => onChange("awayTeamId", e.target.value)}
            >
              <option value="">Select away team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="league" className="block text-sm font-semibold text-slate-300 mb-2">
              League
            </label>
            <select
              id="league"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 transition-all focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-100"
              value={match.leagueId}
              onChange={(e) => onChange("leagueId", e.target.value)}
            >
              <option value="">No league</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="kickoffTime" className="block text-sm font-semibold text-slate-300 mb-2">
              Kickoff Time
            </label>
            <input
              id="kickoffTime"
              type="datetime-local"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 transition-all focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-100"
              value={match.kickoffTime}
              onChange={(e) => onChange("kickoffTime", e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-slate-300 mb-2">
              Status
            </label>
            <select
              id="status"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 transition-all focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-100"
              value={match.status}
              onChange={(e) => onChange("status", e.target.value)}
            >
              <option value="UPCOMING">Upcoming</option>
              <option value="LIVE">Live</option>
              <option value="FINISHED">Finished</option>
            </select>
          </div>

          <div>
            <label htmlFor="score" className="block text-sm font-semibold text-slate-300 mb-2">
              Score
            </label>
            <input
              id="score"
              type="text"
              placeholder="e.g. 2-1"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 transition-all focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-100"
              value={match.score}
              onChange={(e) => onChange("score", e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="venue" className="block text-sm font-semibold text-slate-300 mb-2">
              Venue
            </label>
            <input
              id="venue"
              type="text"
              placeholder="Stadium name"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 transition-all focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-100"
              value={match.venue}
              onChange={(e) => onChange("venue", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border border-slate-600/50 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={
              isSaving ||
              !match.homeTeamId ||
              !match.awayTeamId ||
              match.homeTeamId === match.awayTeamId
            }
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-sm font-medium text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}