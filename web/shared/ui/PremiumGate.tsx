'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
   children: ReactNode;
   isPremium: boolean;
   feature: string;
}

export function PremiumGate({ children, isPremium, feature }: Props) {
   if (isPremium) return <>{children}</>;

   return (
      <div className="relative">
         <div
            className="pointer-events-none select-none blur-sm opacity-40"
            aria-hidden="true"
         >
            {children}
         </div>
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
            <div className="text-center p-6 max-w-xs">
               <div className="w-12 h-12 bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-yellow-400" />
               </div>
               <p className="text-white font-bold text-base mb-1">
                  Premium Feature
               </p>
               <p className="text-slate-400 text-sm mb-4">
                  {feature} requires a Premium subscription.
               </p>
               <Link
                  href="/pricing"
                  className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
               >
                  Upgrade to Premium
               </Link>
            </div>
         </div>
      </div>
   );
}
