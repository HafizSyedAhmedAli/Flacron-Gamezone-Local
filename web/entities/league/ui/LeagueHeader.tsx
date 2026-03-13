import Image from "next/image";
import { MapPin, Trophy, Sparkles, Shield } from "lucide-react";

interface LeagueHeaderProps {
  name: string;
  country: string | null;
  logo: string | null;
}

export function LeagueHeader({ name, country, logo }: LeagueHeaderProps) {
  return (
    <div className="relative overflow-hidden group rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 blur-2xl animate-pulse" />
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(59,130,246,0.4) 2px,transparent 2px),linear-gradient(90deg,rgba(59,130,246,0.4) 2px,transparent 2px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-48 h-48 rounded-full border-4 border-blue-500/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500/30" />
          </div>
          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-blue-500/15" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-64 border-2 border-r-0 border-blue-500/15" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-64 border-2 border-l-0 border-blue-500/15" />
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl" />
        <div className="relative p-8 md:p-12 lg:p-14">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-10">
            {logo && (
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-3xl blur-2xl scale-110 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-3xl blur-xl" />
                <div className="relative bg-gradient-to-br from-slate-700/60 to-slate-800/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-600/50 group-hover:scale-105 transition-transform duration-500">
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(59,130,246,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.5) 1px,transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div className="relative w-28 h-28 md:w-32 md:h-32 flex items-center justify-center">
                    <Image
                      src={logo}
                      alt={name}
                      width={128}
                      height={128}
                      style={{ height: "auto" }}
                      className="object-contain drop-shadow-2xl"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center opacity-70">
                    <Shield className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1 space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full backdrop-blur-sm">
                    <Trophy className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                      Official League
                    </span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200 leading-tight mb-3">
                  {name}
                </h1>
              </div>
              {country && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-3 px-5 py-3 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:border-blue-500/30 transition-colors duration-300 group/country">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center group-hover/country:scale-110 transition-transform duration-300">
                      <MapPin className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                        Country
                      </div>
                      <div className="font-bold text-base text-slate-200">
                        {country}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="pt-4">
                <div className="h-1 bg-gradient-to-r from-blue-500/50 via-cyan-500/30 to-transparent rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 opacity-50">
          <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
}
