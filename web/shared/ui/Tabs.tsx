'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib';

export interface Tab {
   id: string;
   label: string;
   icon?: LucideIcon;
   count?: number;
}

interface TabsProps {
   tabs: Tab[];
   activeTab: string;
   onTabChange: (tabId: string) => void;
   className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
   const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
      let newIdx: number | null = null;
      if (e.key === 'ArrowRight') newIdx = (idx + 1) % tabs.length;
      if (e.key === 'ArrowLeft') newIdx = (idx - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') newIdx = 0;
      if (e.key === 'End') newIdx = tabs.length - 1;
      if (newIdx !== null) {
         e.preventDefault();
         onTabChange(tabs[newIdx].id);
         document.getElementById(`tab-${tabs[newIdx].id}`)?.focus();
      }
   };

   return (
      <div
         role="tablist"
         className={cn(
            'flex gap-1 border-b border-slate-700/50 overflow-x-auto',
            className
         )}
      >
         {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
               <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => onTabChange(tab.id)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={cn(
                     'flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative',
                     isActive
                        ? 'text-blue-400'
                        : 'text-slate-400 hover:text-slate-200'
                  )}
               >
                  {Icon && <Icon className="w-4 h-4" />}
                  {tab.label}
                  {tab.count !== undefined && (
                     <span className="text-xs opacity-60">({tab.count})</span>
                  )}
                  {isActive && (
                     <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t" />
                  )}
               </button>
            );
         })}
      </div>
   );
}
