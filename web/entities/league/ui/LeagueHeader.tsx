import Image from 'next/image';
import { MapPin, Trophy, Sparkles } from 'lucide-react';
import type { League } from '@/shared/types';

export function LeagueHeader({ league }: { league: League }) {
   return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border border-slate-700/50">
         <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
         <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl" />

         <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
               {/* Logo */}
               {league.logo && (
                  <div className="flex-shrink-0">
                     <div className="relative bg-slate-700/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-600/50">
                        <Image
                           src={league.logo}
                           alt={league.name}
                           width={128}
                           height={128}
                           className="object-contain w-28 h-28 md:w-32 md:h-32 drop-shadow-2xl"
                           style={{ height: 'auto' }}
                        />
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                           <Sparkles className="w-4 h-4 text-white" />
                        </div>
                     </div>
                  </div>
               )}

               {/* Info */}
               <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full">
                        <Trophy className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                           Official League
                        </span>
                     </div>
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200 leading-tight">
                     {league.name}
                  </h1>

                  {league.country && (
                     <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 px-5 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl hover:border-blue-500/30 transition-colors group">
                           <MapPin className="w-5 h-5 text-cyan-400" />
                           <div>
                              <div className="text-xs text-slate-500 uppercase tracking-wider">
                                 Country
                              </div>
                              <div className="font-bold text-slate-200">
                                 {league.country}
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 opacity-50" />
      </div>
   );
}
