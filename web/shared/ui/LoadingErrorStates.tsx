import { AlertCircle, Loader2, RefreshCcw } from 'lucide-react';
import type { ReactNode } from 'react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
   return (
      <div className="flex items-center justify-center py-20">
         <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
            <p className="text-slate-300 font-medium">{message}</p>
         </div>
      </div>
   );
}

export function ErrorState({
   error,
   onRetry,
}: {
   error: string;
   onRetry?: () => void;
}) {
   return (
      <div className="bg-slate-900/80 border border-red-500/30 rounded-2xl p-8">
         <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30 flex-shrink-0">
               <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1 space-y-3">
               <div>
                  <h3 className="text-red-400 font-bold text-lg mb-1">
                     Something went wrong
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                     {error}
                  </p>
               </div>
               {onRetry && (
                  <button
                     onClick={onRetry}
                     className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all group"
                  >
                     <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                     Try Again
                  </button>
               )}
            </div>
         </div>
      </div>
   );
}

export function EmptyState({
   icon,
   title,
   description,
   action,
}: {
   icon?: ReactNode;
   title: string;
   description?: string;
   action?: ReactNode;
}) {
   return (
      <div className="text-center py-20 bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-slate-700/50">
         {icon && (
            <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-700/50">
               {icon}
            </div>
         )}
         <h3 className="text-xl font-bold text-slate-300 mb-2">{title}</h3>
         {description && (
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
               {description}
            </p>
         )}
         {action}
      </div>
   );
}
