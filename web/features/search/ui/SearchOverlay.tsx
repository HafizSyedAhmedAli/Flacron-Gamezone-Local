'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
   Search,
   X,
   Trophy,
   Users,
   Play,
   Clock,
   Globe,
   ChevronRight,
   TrendingUp,
} from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { cn } from '@/shared/lib';

interface Props {
   isOpen: boolean;
   onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: Props) {
   const inputRef = useRef<HTMLInputElement>(null);
   const {
      query,
      setQuery,
      results,
      loading,
      recentSearches,
      hasResults,
      handleSelect,
   } = useSearch();

   useEffect(() => {
      if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
   }, [isOpen]);

   useEffect(() => {
      const fn = (e: KeyboardEvent) => {
         if (e.key === 'Escape') handleClose();
      };
      window.addEventListener('keydown', fn);
      return () => window.removeEventListener('keydown', fn);
   }, []);

   const handleClose = () => {
      setQuery('');
      onClose();
   };

   const handleResultClick = () => {
      handleSelect();
      onClose();
   };

   if (!isOpen) return null;

   return (
      <div
         className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
         role="dialog"
         aria-modal="true"
      >
         <div
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={handleClose}
         />

         <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden">
            {/* Input */}
            <div className="p-5 border-b border-slate-700/40 flex items-center gap-4">
               <Search
                  className={cn(
                     'w-5 h-5 flex-shrink-0 transition-colors',
                     loading
                        ? 'text-blue-400 animate-pulse'
                        : query
                          ? 'text-blue-400'
                          : 'text-slate-500'
                  )}
               />
               <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search leagues, teams, matches…"
                  className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-base"
               />
               {query ? (
                  <button
                     onClick={() => setQuery('')}
                     className="p-1.5 hover:bg-slate-700/60 rounded-xl text-slate-400 hover:text-white transition-all"
                  >
                     <X className="w-4 h-4" />
                  </button>
               ) : (
                  <kbd className="hidden sm:flex text-slate-500 text-xs bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
                     ESC
                  </kbd>
               )}
               <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-700/60 rounded-xl text-slate-400 hover:text-white transition-all"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
               {/* Recent Searches */}
               {!query && recentSearches.length > 0 && (
                  <div className="p-4 border-b border-slate-700/30">
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Recent
                     </p>
                     <div className="flex flex-wrap gap-2">
                        {recentSearches.map((s) => (
                           <button
                              key={s}
                              onClick={() => setQuery(s)}
                              className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 hover:border-blue-500/40 rounded-xl text-sm text-slate-300 transition-all"
                           >
                              {s}
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               {/* Quick Links */}
               {!query && (
                  <div className="p-5">
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" /> Quick Links
                     </p>
                     <div className="grid grid-cols-3 gap-3">
                        {[
                           { href: '/leagues', icon: Trophy, label: 'Leagues' },
                           { href: '/teams', icon: Users, label: 'Teams' },
                           { href: '/live', icon: Play, label: 'Live' },
                        ].map(({ href, icon: Icon, label }) => (
                           <Link
                              key={href}
                              href={href}
                              onClick={handleClose}
                              className="flex flex-col items-center gap-2.5 p-4 bg-slate-800/40 hover:bg-slate-700/60 rounded-2xl border border-slate-700/40 hover:border-slate-600/60 transition-all group"
                           >
                              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                 <Icon className="w-5 h-5 text-blue-400" />
                              </div>
                              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                                 {label}
                              </span>
                           </Link>
                        ))}
                     </div>
                  </div>
               )}

               {/* Loading */}
               {query && loading && (
                  <div className="p-8 text-center text-slate-400">
                     <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                     <p className="text-sm">Searching…</p>
                  </div>
               )}

               {/* No results */}
               {query && !loading && !hasResults && (
                  <div className="p-10 text-center">
                     <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                     <p className="text-slate-300 font-semibold mb-1">
                        No results found
                     </p>
                     <p className="text-slate-500 text-sm">
                        Try different keywords
                     </p>
                  </div>
               )}

               {/* Results */}
               {hasResults && (
                  <div className="p-3 space-y-1">
                     {results?.leagues && results.leagues.length > 0 && (
                        <ResultSection
                           icon={Trophy}
                           label="Leagues"
                           color="blue"
                        >
                           {results.leagues.map((league) => (
                              <ResultItem
                                 key={league.id}
                                 href={`/leagues/${league.id}`}
                                 onClick={handleResultClick}
                              >
                                 <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center overflow-hidden">
                                    {league.logo ? (
                                       <img
                                          src={league.logo}
                                          alt={league.name}
                                          className="w-7 h-7 object-contain"
                                       />
                                    ) : (
                                       <Trophy className="w-4 h-4 text-blue-400" />
                                    )}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white text-sm truncate">
                                       {league.name}
                                    </p>
                                    {league.country && (
                                       <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                          <Globe className="w-3 h-3" />{' '}
                                          {league.country}
                                       </p>
                                    )}
                                 </div>
                              </ResultItem>
                           ))}
                        </ResultSection>
                     )}

                     {results?.teams && results.teams.length > 0 && (
                        <ResultSection
                           icon={Users}
                           label="Teams"
                           color="purple"
                        >
                           {results.teams.map((team) => (
                              <ResultItem
                                 key={team.id}
                                 href={`/teams/${team.id}`}
                                 onClick={handleResultClick}
                              >
                                 <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center overflow-hidden">
                                    {team.logo ? (
                                       <img
                                          src={team.logo}
                                          alt={team.name}
                                          className="w-7 h-7 object-contain"
                                       />
                                    ) : (
                                       <span className="text-sm font-bold text-purple-400">
                                          {team.name.slice(0, 2)}
                                       </span>
                                    )}
                                 </div>
                                 <p className="flex-1 font-semibold text-white text-sm truncate">
                                    {team.name}
                                 </p>
                              </ResultItem>
                           ))}
                        </ResultSection>
                     )}

                     {results?.matches && results.matches.length > 0 && (
                        <ResultSection
                           icon={Play}
                           label="Matches"
                           color="green"
                        >
                           {results.matches.map((match) => (
                              <ResultItem
                                 key={match.id}
                                 href={`/match/${match.id}`}
                                 onClick={handleResultClick}
                              >
                                 <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center">
                                    <Play className="w-4 h-4 text-green-400" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white text-sm truncate">
                                       {match.homeTeam.name} vs{' '}
                                       {match.awayTeam.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                       {match.status === 'LIVE' && (
                                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
                                       )}
                                       <p className="text-xs text-slate-500">
                                          {match.league?.name ?? 'Match'}
                                       </p>
                                       {match.score && (
                                          <p className="text-xs font-bold text-green-400">
                                             {match.score}
                                          </p>
                                       )}
                                    </div>
                                 </div>
                              </ResultItem>
                           ))}
                        </ResultSection>
                     )}
                  </div>
               )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-600">
               <span>Results from all leagues & teams</span>
               <Link
                  href={
                     query
                        ? `/search?q=${encodeURIComponent(query)}`
                        : '/search'
                  }
                  onClick={handleResultClick}
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-400 font-semibold"
               >
                  View all <ChevronRight className="w-3 h-3" />
               </Link>
            </div>
         </div>
      </div>
   );
}

function ResultSection({
   icon: Icon,
   label,
   color,
   children,
}: {
   icon: React.ElementType;
   label: string;
   color: string;
   children: React.ReactNode;
}) {
   const colors: Record<string, string> = {
      blue: 'text-blue-400 bg-blue-500/10',
      purple: 'text-purple-400 bg-purple-500/10',
      green: 'text-green-400 bg-green-500/10',
   };
   return (
      <div className="mb-4 last:mb-0">
         <div className="px-3 py-2 flex items-center gap-2.5">
            <div
               className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center',
                  colors[color]
               )}
            >
               <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
               {label}
            </span>
         </div>
         {children}
      </div>
   );
}

function ResultItem({
   href,
   onClick,
   children,
}: {
   href: string;
   onClick: () => void;
   children: React.ReactNode;
}) {
   return (
      <Link
         href={href}
         onClick={onClick}
         className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/60 rounded-xl transition-all group"
      >
         {children}
         <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
      </Link>
   );
}
