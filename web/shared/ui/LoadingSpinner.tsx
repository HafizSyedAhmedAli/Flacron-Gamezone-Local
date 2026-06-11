'use client';

import { cn } from '@/shared/lib';

type Size = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
   size?: Size;
   message?: string;
   fullScreen?: boolean;
   className?: string;
}

const SIZE_CLASSES: Record<Size, string> = {
   sm: 'w-5 h-5 border-2',
   md: 'w-8 h-8 border-2',
   lg: 'w-12 h-12 border-4',
};

export function LoadingSpinner({
   size = 'md',
   message,
   fullScreen = false,
   className,
}: LoadingSpinnerProps) {
   const spinner = (
      <div className="flex items-center gap-3">
         <div
            className={cn(
               'rounded-full border-slate-600 border-t-blue-400 animate-spin',
               SIZE_CLASSES[size]
            )}
            aria-hidden="true"
         />
         {message && (
            <span className="text-sm font-medium text-slate-300">
               {message}
            </span>
         )}
      </div>
   );

   if (fullScreen) {
      return (
         <div
            className={cn(
               'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm',
               className
            )}
            role="status"
            aria-live="polite"
         >
            {spinner}
         </div>
      );
   }

   return (
      <div
         className={cn('flex items-center justify-center py-12', className)}
         role="status"
         aria-live="polite"
      >
         {spinner}
      </div>
   );
}

export default LoadingSpinner;
