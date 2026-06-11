import { Trophy, Users, Calendar, Play } from 'lucide-react';

interface Stats {
   leagues: number;
   teams: number;
   matches: number;
   streams: number;
}

const CARDS = [
   {
      key: 'leagues' as const,
      label: 'Leagues',
      icon: Trophy,
      from: 'from-blue-500/20',
      border: 'border-blue-500/20 hover:border-blue-500/40',
      iconCls: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      textCls: 'text-blue-400',
   },
   {
      key: 'teams' as const,
      label: 'Teams',
      icon: Users,
      from: 'from-purple-500/20',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconCls: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      textCls: 'text-purple-400',
   },
   {
      key: 'matches' as const,
      label: 'Matches',
      icon: Calendar,
      from: 'from-green-500/20',
      border: 'border-green-500/20 hover:border-green-500/40',
      iconCls: 'bg-green-500/20 border-green-500/30 text-green-400',
      textCls: 'text-green-400',
   },
   {
      key: 'streams' as const,
      label: 'Streams',
      icon: Play,
      from: 'from-cyan-500/20',
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconCls: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      textCls: 'text-cyan-400',
   },
] as const;

export function StatsCards({ stats }: { stats: Stats }) {
   return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         {CARDS.map(
            ({ key, label, icon: Icon, from, border, iconCls, textCls }) => (
               <div
                  key={key}
                  className={`bg-gradient-to-br ${from} to-transparent border ${border} rounded-2xl p-5 transition-all hover:scale-[1.02]`}
               >
                  <div
                     className={`w-10 h-10 rounded-xl ${iconCls} border flex items-center justify-center mb-4`}
                  >
                     <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                     {Number(stats[key]).toLocaleString()}
                  </div>
                  <div className={`text-sm font-medium ${textCls}`}>
                     {label}
                  </div>
               </div>
            )
         )}
      </div>
   );
}
