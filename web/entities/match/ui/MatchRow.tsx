import Link from 'next/link';
import Image from 'next/image';
import { Clock, Trophy } from 'lucide-react';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { formatDateTime, formatDateShort } from '@/shared/lib/format';
import type { Match } from '@/shared/types';

interface Props {
   match: Match;
}

export function MatchRow({ match }: Props) {
   return (
      <Link href={`/match/${match.id}`}>
         <div className="group bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-4 transition-all hover:scale-[1.01] cursor-pointer">
            {match.league && (
               <div className="flex justify-center mb-3">
                  <div className="inline-flex items-center gap-1.5 bg-slate-800/70 border border-slate-600/30 rounded-full px-3 py-1">
                     <Trophy className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                     <span className="text-xs font-semibold text-slate-300 truncate max-w-[200px]">
                        {match.league.name}
                     </span>
                  </div>
               </div>
            )}

            <div className="flex items-center justify-between gap-3">
               {/* Home */}
               <div className="flex items-center gap-2 flex-1 min-w-0">
                  {match.homeTeam.logo ? (
                     <Image
                        src={match.homeTeam.logo}
                        alt={match.homeTeam.name}
                        width={36}
                        height={36}
                        className="object-contain rounded-lg bg-white/5 border border-slate-600/50 p-1 flex-shrink-0"
                        style={{ height: 'auto' }}
                     />
                  ) : (
                     <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {match.homeTeam.name.slice(0, 2).toUpperCase()}
                     </div>
                  )}
                  <div className="min-w-0">
                     <span className="font-bold text-sm truncate block group-hover:text-blue-400 transition-colors">
                        {match.homeTeam.name}
                     </span>
                     <span className="text-xs text-slate-500">Home</span>
                  </div>
               </div>

               {/* Score / time */}
               <div className="text-center flex-shrink-0 min-w-[90px]">
                  {match.status !== 'UPCOMING' ? (
                     <>
                        <p className="text-2xl font-black text-white">
                           {match.score ?? '–'}
                        </p>
                        <StatusBadge status={match.status} size="sm" />
                     </>
                  ) : (
                     <>
                        <StatusBadge status="UPCOMING" size="sm" />
                        <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                           <Clock className="w-3 h-3" />
                           {formatDateTime(match.kickoffTime)}
                        </p>
                     </>
                  )}
               </div>

               {/* Away */}
               <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                  <div className="min-w-0 text-right">
                     <span className="font-bold text-sm truncate block group-hover:text-purple-400 transition-colors">
                        {match.awayTeam.name}
                     </span>
                     <span className="text-xs text-slate-500">Away</span>
                  </div>
                  {match.awayTeam.logo ? (
                     <Image
                        src={match.awayTeam.logo}
                        alt={match.awayTeam.name}
                        width={36}
                        height={36}
                        className="object-contain rounded-lg bg-white/5 border border-slate-600/50 p-1 flex-shrink-0"
                        style={{ height: 'auto' }}
                     />
                  ) : (
                     <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {match.awayTeam.name.slice(0, 2).toUpperCase()}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </Link>
   );
}
