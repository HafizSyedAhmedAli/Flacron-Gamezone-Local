"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface TeamEditModalProps {
  isOpen: boolean;
  team: {
    id: string;
    name: string;
    logo: string;
    leagueId: string;
  } | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: string) => void;
  isSaving: boolean;
  leagues: any[];
}

export function TeamEditModal({
  isOpen,
  team,
  onClose,
  onSave,
  onChange,
  isSaving,
  leagues,
}: TeamEditModalProps) {
  const [logoError, setLogoError] = useState(false);

  // Reset error whenever the logo URL changes
  useEffect(() => {
    setLogoError(false);
  }, [team?.logo]);

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

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => !isSaving && onClose()}
      />
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 z-10 my-8 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Edit Team</h3>

        <label className="block text-sm mb-2">Name</label>
        <input
          className="w-full px-3 py-2 mb-3 rounded bg-slate-800 border border-slate-700"
          value={team.name}
          onChange={(e) => onChange("name", e.target.value)}
        />

        <label className="block text-sm mb-2">League</label>
        <select
          className="w-full px-3 py-2 mb-3 rounded bg-slate-800 border border-slate-700"
          value={team.leagueId}
          onChange={(e) => onChange("leagueId", e.target.value)}
        >
          <option value="">No league</option>
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </select>

        <label className="block text-sm mb-2">Logo URL</label>
        <input
          className="w-full px-3 py-2 mb-2 rounded bg-slate-800 border border-slate-700"
          value={team.logo}
          onChange={(e) => onChange("logo", e.target.value)}
        />

        {team.logo && !logoError && (
          <div className="mb-3">
            <div className="text-sm mb-1">Preview</div>
            <img
              src={team.logo}
              alt="logo preview"
              className="w-32 h-16 object-contain rounded bg-white/5 border border-slate-700"
              onError={() => setLogoError(true)}
            />
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving || team.name.trim() === ""}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
