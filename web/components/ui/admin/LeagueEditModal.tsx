"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface LeagueEditModalProps {
  isOpen: boolean;
  league: {
    id: string;
    name: string;
    country: string;
    logo: string;
  } | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: string) => void;
  isSaving: boolean;
}

export function LeagueEditModal({
  isOpen,
  league,
  onClose,
  onSave,
  onChange,
  isSaving,
}: LeagueEditModalProps) {
  if (!isOpen || !league) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => !isSaving && onClose()}
      />
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 z-10">
        <h3 className="text-xl font-semibold mb-4">Edit League</h3>

        <label className="block text-sm mb-2">Name</label>
        <input
          className="w-full px-3 py-2 mb-3 rounded bg-slate-800 border border-slate-700"
          value={league.name}
          onChange={(e) => onChange("name", e.target.value)}
        />

        <label className="block text-sm mb-2">Country</label>
        <input
          className="w-full px-3 py-2 mb-3 rounded bg-slate-800 border border-slate-700"
          value={league.country}
          onChange={(e) => onChange("country", e.target.value)}
        />

        <label className="block text-sm mb-2">Logo URL</label>
        <input
          className="w-full px-3 py-2 mb-2 rounded bg-slate-800 border border-slate-700"
          value={league.logo}
          onChange={(e) => onChange("logo", e.target.value)}
        />

        {league.logo && (
          <div className="mb-3">
            <div className="text-sm mb-1">Preview</div>
            <img
              src={league.logo}
              alt="logo preview"
              className="w-32 h-16 object-contain rounded bg-white/5 border border-slate-700"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving || league.name.trim() === ""}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
