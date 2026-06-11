import Image from 'next/image';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import type { StandingEntry } from '@/shared/types';

interface Props {
   standings: StandingEntry[];
   promotionZones?: number;
   relegationZones?: number;
}

export function StandingsTable({
   standings,
   promotionZones = 4,
   relegationZones = 3,
}: Props) {
   if (standings.length === 0) {
      return (
         <div className="p-8 text-center text-slate-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No standings available yet.</p>
         </div>
      );
   }

   const headers = ['#', 'Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'];

   return (
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
               <thead className="bg-slate-800/50">
                  <tr>
                     {headers.map((h, i) => (
                        <th
                           key={h}
                           className={`p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${
                              i <= 1 ? 'text-left' : 'text-center'
                           }`}
                        >
                           {h}
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {standings.map((entry, idx) => {
                     const isPromotion = idx < promotionZones;
                     const isRelegation =
                        idx >= standings.length - relegationZones &&
                        idx >= promotionZones;

                     return (
                        <tr
                           key={entry.team.id}
                           className="border-t border-slate-700/40 hover:bg-slate-800/30 transition-colors"
                        >
                           <td className="p-3">
                              <span
                                 className={`text-sm font-semibold ${
                                    isPromotion
                                       ? 'text-green-400'
                                       : isRelegation
                                         ? 'text-red-400'
                                         : 'text-slate-300'
                                 }`}
                              >
                                 {idx + 1}
                              </span>
                           </td>
                           <td className="p-3">
                              <Link
                                 href={`/teams/${entry.team.id}`}
                                 className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                              >
                                 {entry.team.logo && (
                                    <Image
                                       src={entry.team.logo}
                                       alt={entry.team.name}
                                       width={20}
                                       height={20}
                                       className="rounded"
                                       style={{ height: 'auto' }}
                                    />
                                 )}
                                 <span className="text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                                    {entry.team.name}
                                 </span>
                              </Link>
                           </td>
                           {[
                              entry.played,
                              entry.won,
                              entry.drawn,
                              entry.lost,
                              entry.goalsFor,
                              entry.goalsAgainst,
                           ].map((val, i) => (
                              <td
                                 key={i}
                                 className="p-3 text-center text-sm text-slate-300"
                              >
                                 {val}
                              </td>
                           ))}
                           <td className="p-3 text-center text-sm">
                              <span
                                 className={
                                    entry.goalDifference > 0
                                       ? 'text-green-400'
                                       : entry.goalDifference < 0
                                         ? 'text-red-400'
                                         : 'text-slate-300'
                                 }
                              >
                                 {entry.goalDifference > 0 ? '+' : ''}
                                 {entry.goalDifference}
                              </span>
                           </td>
                           <td className="p-3 text-center font-bold text-sm text-white">
                              {entry.points}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>
   );
}
