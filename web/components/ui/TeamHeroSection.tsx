import { Shield, Award } from "lucide-react";

interface TeamHeroSectionProps {
  teamName: string;
  teamLogo: string | null;
  leagueName?: string;
  leagueCountry?: string | null;
  lastFiveResults: Array<"W" | "D" | "L">;
}

export function TeamHeroSection({
  teamName,
  teamLogo,
  leagueName,
  leagueCountry,
  lastFiveResults,
}: TeamHeroSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50">
      {/* Animated background */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse-slow"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse-slow"
        style={{
          background: "radial-gradient(circle, #06b6d4, transparent)",
          animationDelay: "1s",
        }}
      />

      <div className="relative z-10 p-8 md:p-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Team Logo */}
          <div className="relative shrink-0">
            <div className="relative group">
              <div className="relative w-40 h-40 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center p-6 shadow-2xl transform transition-transform duration-500 group-hover:scale-105 group-hover:border-blue-500/50">
                {teamLogo ? (
                  <img
                    src={teamLogo}
                    alt={teamName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full flex items-center justify-center font-bold text-6xl text-blue-400"
                  style={{
                    display: teamLogo ? "none" : "flex",
                    textShadow: "0 4px 12px rgba(59, 130, 246, 0.5)",
                  }}
                >
                  {teamName.substring(0, 2).toUpperCase()}
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              </div>

              {/* Form indicator */}
              {lastFiveResults.length > 0 && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-slate-900/90 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-700/50 shadow-lg">
                  {lastFiveResults.map((result, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        result === "W"
                          ? "bg-green-500 text-white"
                          : result === "D"
                            ? "bg-yellow-500 text-slate-900"
                            : "bg-red-500 text-white"
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Team Info */}
          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              {leagueName && (
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm font-medium text-blue-400">
                    <Shield className="w-4 h-4" />
                    {leagueName}
                  </div>
                  {leagueCountry && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full text-sm text-slate-400">
                      <Award className="w-4 h-4" />
                      {leagueCountry}
                    </div>
                  )}
                </div>
              )}

              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent leading-tight">
                {teamName}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
