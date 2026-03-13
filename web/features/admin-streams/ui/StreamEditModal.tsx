"use client";

import { useState, useEffect } from "react";
import { X, Save, Play } from "lucide-react";
import type { AdminStream } from "../api/streamsApi";

interface StreamFormData {
  type: "EMBED" | "NONE";
  provider: string;
  url: string;
  isActive: boolean;
}

interface StreamEditModalProps {
  stream: AdminStream | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StreamFormData) => Promise<void>;
  saving: boolean;
}

export function StreamEditModal({
  stream,
  isOpen,
  onClose,
  onSave,
  saving,
}: StreamEditModalProps) {
  const [form, setForm] = useState<StreamFormData>({
    type: "NONE",
    provider: "",
    url: "",
    isActive: false,
  });

  useEffect(() => {
    if (stream) {
      setForm({
        type: stream.type,
        provider: stream.provider ?? "",
        url: stream.url ?? "",
        isActive: stream.isActive,
      });
    } else {
      setForm({ type: "NONE", provider: "", url: "", isActive: false });
    }
  }, [stream, isOpen]);

  if (!isOpen) return null;

  const matchName = stream?.match
    ? `${stream.match.homeTeam.name} vs ${stream.match.awayTeam.name}`
    : "Stream";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !saving && onClose()}
      />
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
              <Play className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Edit Stream</h2>
              <p className="text-xs text-slate-500">{matchName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-slate-800 rounded-lg disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value as "EMBED" | "NONE",
                }))
              }
              className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 rounded-xl text-sm outline-none"
            >
              <option value="NONE">None</option>
              <option value="EMBED">Embed</option>
            </select>
          </div>
          {form.type === "EMBED" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Provider
                </label>
                <input
                  type="text"
                  value={form.provider}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, provider: e.target.value }))
                  }
                  placeholder="youtube"
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 rounded-xl text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Embed URL
                </label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, url: e.target.value }))
                  }
                  placeholder="https://www.youtube.com/embed/…"
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 rounded-xl text-sm outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  className="w-4 h-4 accent-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm text-slate-300 cursor-pointer"
                >
                  Active (show to users)
                </label>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} />
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
