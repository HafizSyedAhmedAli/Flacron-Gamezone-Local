'use client';

import { CheckCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/shared/lib';
import type { AlertMessage as AlertMessageType } from '@/shared/types';

const STYLES = {
   success: {
      container: 'bg-green-600/20 border-green-500/50 shadow-green-500/10',
      icon: 'text-green-400',
      text: 'text-green-400',
      Icon: CheckCircle,
   },
   error: {
      container: 'bg-red-600/20 border-red-500/50 shadow-red-500/10',
      icon: 'text-red-400',
      text: 'text-red-400',
      Icon: XCircle,
   },
   info: {
      container: 'bg-blue-600/20 border-blue-500/50 shadow-blue-500/10',
      icon: 'text-blue-400',
      text: 'text-blue-400',
      Icon: Info,
   },
} as const;

interface AlertMessageProps {
   message: AlertMessageType | null;
   className?: string;
}

export function AlertMessage({ message, className }: AlertMessageProps) {
   if (!message) return null;

   const { container, icon, text, Icon } = STYLES[message.type];

   return (
      <div
         className={cn(
            'backdrop-blur-xl border rounded-xl p-4 flex items-start gap-3 shadow-xl animate-in slide-in-from-top-2 transition-all duration-300',
            container,
            className
         )}
      >
         <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', icon)} />
         <p className={cn('text-sm font-medium flex-1', text)}>
            {message.text}
         </p>
      </div>
   );
}
