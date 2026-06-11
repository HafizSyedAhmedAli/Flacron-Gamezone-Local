import { cn } from '@/shared/lib';
import type { MatchStatus } from '@/shared/types';

interface Props {
   status: MatchStatus;
   size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
   const base = 'inline-flex items-center gap-1.5 font-bold rounded-full';
   const sizeClass =
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

   if (status === 'LIVE') {
      return (
         <span
            className={cn(
               base,
               sizeClass,
               'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg animate-pulse'
            )}
         >
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            LIVE
         </span>
      );
   }

   if (status === 'FINISHED') {
      return (
         <span
            className={cn(base, sizeClass, 'bg-slate-600/80 text-slate-200')}
         >
            FINISHED
         </span>
      );
   }

   return (
      <span
         className={cn(
            base,
            sizeClass,
            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
         )}
      >
         UPCOMING
      </span>
   );
}
