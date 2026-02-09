"use client";

import { useState } from "react";
import {
  Play,
  Tv,
  ExternalLink,
  AlertTriangle,
  Maximize2,
  Volume2,
} from "lucide-react";

interface StreamEmbedProps {
  stream: {
    type: "EMBED" | "NONE";
    provider: string | null;
    url: string | null;
    isActive: boolean;
  } | null;
  matchStatus: "UPCOMING" | "LIVE" | "FINISHED";
  homeTeam: string;
  awayTeam: string;
}

export default function StreamEmbed({
  stream,
  matchStatus,
  homeTeam,
  awayTeam,
}: StreamEmbedProps) {
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedError, setEmbedError] = useState(false);

  // No stream or score-only mode
  if (!stream || stream.type === "NONE" || !stream.isActive) {
    return (
      <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 border-slate-700/50 rounded-2xl p-8 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(100,116,139,0.1),transparent)]"></div>
        <div className="relative">
          <div className="w-20 h-20 bg-slate-800/70 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tv className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">
            Score-Only Mode
          </h3>
          <p className="text-sm text-slate-400 font-semibold max-w-md mx-auto">
            No video stream is available for this match. Follow the live score
            updates above.
          </p>
        </div>
      </div>
    );
  }

  // Stream is available but not yet activated by user
  if (!showEmbed) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 to-cyan-900/30 border-2 border-cyan-500/30 rounded-2xl p-8 text-center shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(6,182,212,0.15),transparent)]"></div>
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Play className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
            Live Stream Available
          </h3>
          <p className="text-sm text-cyan-300 font-semibold mb-2">
            {homeTeam} vs {awayTeam}
          </p>
          {stream.provider && (
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 backdrop-blur-sm rounded-lg px-4 py-2 mb-6">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-cyan-400">
                Provided by {stream.provider}
              </span>
            </div>
          )}

          <div className="space-y-3 max-w-md mx-auto">
            <button
              onClick={() => {
                setShowEmbed(true);
                setEmbedError(false);
              }}
              className="group relative w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:via-blue-500 hover:to-cyan-500 text-white font-black px-8 py-4 rounded-xl shadow-lg shadow-cyan-500/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 uppercase tracking-wide"
            >
              <Play className="w-6 h-6 group-hover:scale-125 transition-transform" />
              <span>Watch Live Stream</span>
              <Maximize2 className="w-5 h-5 group-hover:scale-125 transition-transform" />
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-xs font-bold text-yellow-400 mb-1">
                  Legal Notice
                </p>
                <p className="text-xs text-yellow-300/80 font-medium">
                  This stream is provided by official broadcasters and partners.
                  We do not host or distribute unauthorized content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the embedded stream
  return (
    <div className="relative overflow-hidden bg-slate-900/95 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(6,182,212,0.1),transparent)]"></div>

      {/* Header */}
      <div className="relative flex items-center justify-between p-4 bg-slate-950/50 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          <div>
            <div className="text-sm font-black text-white uppercase tracking-wide">
              Live Stream
            </div>
            {stream.provider && (
              <div className="text-xs text-cyan-400 font-semibold">
                {stream.provider}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmbed(false)}
            className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </div>

      {/* Stream Container */}
      <div className="relative bg-black" style={{ paddingBottom: "56.25%" }}>
        {embedError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center p-8">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h4 className="text-lg font-black text-white mb-2">
                Stream Error
              </h4>
              <p className="text-sm text-slate-400 mb-4">
                Unable to load the embedded stream
              </p>
            </div>
          </div>
        ) : stream.url ? (
          <iframe
            src={stream.url}
            className="absolute inset-0 w-full h-full"
            onError={() => setEmbedError(true)}
            allowFullScreen
            title={`${homeTeam} vs ${awayTeam} - Live Stream`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center p-8">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h4 className="text-lg font-black text-white mb-2">
                URL Error
              </h4>
              <p className="text-sm text-slate-400 mb-4">
                Stream URL unavailable
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative p-4 bg-slate-950/50 border-t border-cyan-500/20">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="font-semibold">
              Streaming: {homeTeam} vs {awayTeam}
            </span>
          </div>
          <div className="font-semibold">
            Status: <span className="text-cyan-400">{matchStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
