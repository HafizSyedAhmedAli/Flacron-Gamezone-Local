"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { Button } from "@/components/ui/button";

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

  // Prevent body scroll when modal is open
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

  // Focus management and Escape key handling
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
        className="absolute inset-0 bg-black/60"
        onClick={() => !isSaving && onClose()}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleIdFull}
        aria-describedby={descIdFull}
        tabIndex={-1}
        className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 z-10 my-8 max-h-[90vh] overflow-y-auto"
      >
        <h3 id={titleIdFull} className="text-xl font-semibold mb-4">
          Edit Match
        </h3>

        <div id={descIdFull}>
          <label htmlFor="homeTeam" className="block text-sm mb-2">
            Home Team
          </label>
          <select
            id="homeTeam"
            className="w-full px-3 py-2 mb-3 rounded bg-slate-800 border border-slate-700"
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

          <label htmlFor="awayTeam" className="block text-sm mb-2">
            Away Team
          </label>
          <select
            id="awayTeam"
            className="w-full px-3 py-2 mb-3 rounded bg-slate-800 border border-slate-700"
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

          <label htmlFor="league" className="block text-sm mb-2">
            League
          </label>
          <select
            id="league"
            className="w-full px-3 py-2 mb-3 rounded bg-slate-800 border border-slate-700"
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

          <label htmlFor="kickoffTime" className="block text-sm mb-2">
            Kickoff Time
          </label>
          <input
            id="kickoffTime"
            type="datetime-local"
            className="w-full px-3 py-2 mb-3 rounded bg-slate-800 border border-slate-700"
            value={match.kickoffTime}
            onChange={(e) => onChange("kickoffTime", e.target.value)}
          />

          <label htmlFor="status" className="block text-sm mb-2">
            Status
          </label>
          <select
            id="status"
            className="w-full px-3 py-2 mb-3 rounded bg-slate-800 border border-slate-700"
            value={match.status}
            onChange={(e) => onChange("status", e.target.value)}
          >
            <option value="UPCOMING">Upcoming</option>
            <option value="LIVE">Live</option>
            <option value="FINISHED">Finished</option>
          </select>

          <label htmlFor="score" className="block text-sm mb-2">
            Score
          </label>
          <input
            id="score"
            type="text"
            placeholder="e.g. 2-1"
            className="w-full px-3 py-2 mb-3 rounded bg-slate-800 border border-slate-700"
            value={match.score}
            onChange={(e) => onChange("score", e.target.value)}
          />

          <label htmlFor="venue" className="block text-sm mb-2">
            Venue
          </label>
          <input
            id="venue"
            type="text"
            className="w-full px-3 py-2 mb-3 rounded bg-slate-800 border border-slate-700"
            value={match.venue}
            onChange={(e) => onChange("venue", e.target.value)}
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={
              isSaving ||
              !match.homeTeamId ||
              !match.awayTeamId ||
              match.homeTeamId === match.awayTeamId
            }
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
