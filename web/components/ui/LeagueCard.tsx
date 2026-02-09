import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin } from "lucide-react";

interface LeagueCardProps {
  id: string;
  name: string;
  country: string | null;
  logo: string;
  index?: number;
}

export function LeagueCard({
  id,
  name,
  country,
  logo,
  index = 0,
}: LeagueCardProps) {
  return (
    <Link
      href={`/leagues/${id}`}
      style={{ animationDelay: `${index * 80}ms` }}
      className="animate-in fade-in slide-in-from-bottom-6 duration-700 group"
    >
      <div className="relative h-full overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02]">
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-purple-500/0 group-hover:from-blue-500/20 group-hover:via-cyan-500/10 group-hover:to-purple-500/20 transition-all duration-500 rounded-2xl blur-xl"></div>
        
        {/* Card Background */}
        <div className="relative bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700/50 group-hover:border-blue-500/50 transition-all duration-500 rounded-2xl p-6 h-full flex flex-col">
          
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          
          {/* Corner Accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Content */}
          <div className="relative flex flex-col items-center justify-center flex-1 space-y-4">
            {/* Logo Container */}
            <div className="relative">
              {/* Glow Ring */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-md scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              
              {/* Logo Background */}
              <div className="relative bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-4 group-hover:scale-110 transition-transform duration-500">
                <div className="w-16 h-16 flex items-center justify-center">
                  <Image
                    src={logo}
                    alt={name}
                    width={64}
                    height={64}
                    className="object-contain drop-shadow-lg"
                  />
                </div>
              </div>
              
              {/* Pulsing Dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* League Name */}
            <div className="text-center space-y-2 flex-1 flex flex-col justify-center">
              <h3 className="font-bold text-lg leading-tight line-clamp-2 text-white group-hover:text-blue-100 transition-colors duration-300">
                {name}
              </h3>
              
              {/* Country */}
              {country && (
                <div className="flex items-center justify-center gap-1.5 text-slate-400 group-hover:text-cyan-400 transition-colors duration-300">
                  <MapPin className="w-3.5 h-3.5" />
                  <p className="text-xs font-medium uppercase tracking-wide">
                    {country}
                  </p>
                </div>
              )}
            </div>

            {/* View Details Button */}
            <div className="w-full pt-4 border-t border-slate-700/50 group-hover:border-blue-500/30 transition-colors duration-500">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400 group-hover:text-blue-400 transition-colors duration-300">
                <span className="font-medium">View League</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>

          {/* Animated Border Gradient */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </Link>
  );
}