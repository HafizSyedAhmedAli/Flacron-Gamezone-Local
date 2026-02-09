"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

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
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [league?.logo]);

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

  if (!isOpen || !league) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !isSaving && onClose()}
      />
      <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl w-full max-w-lg p-6 z-10 my-8 max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-500/10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Edit League
          </h3>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-700 hover:from-red-600 hover:to-red-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              League Name
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 transition-all focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-100"
              value={league.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Enter league name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Country
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 transition-all focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-100"
              value={league.country}
              onChange={(e) => onChange("country", e.target.value)}
              placeholder="Enter country"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Logo URL
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600/50 focus:border-blue-500/50 transition-all focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-100"
              value={league.logo}
              onChange={(e) => onChange("logo", e.target.value)}
              placeholder="Enter logo URL"
            />
          </div>

          {/* Image Preview */}
          {league.logo && !imageError && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
              <div className="text-sm font-semibold text-slate-300 mb-3">
                Logo Preview
              </div>
              <div className="flex justify-center">
                <div className="w-32 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-3 flex items-center justify-center">
                  <img
                    src={league.logo}
                    alt="logo preview"
                    className="w-full h-full object-contain"
                    onError={() => setImageError(true)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
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
            disabled={isSaving || league.name.trim() === ""}
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